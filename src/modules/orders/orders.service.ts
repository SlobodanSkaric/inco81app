import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Orders } from 'src/entitets/entities/Orders';
import { ApiResponse } from 'src/misc/api.response.dto';
import { EntityManager, LessThan, Repository } from 'typeorm';
import { OrderGetAllDto } from './dtos/order.get.all.dto';
import { OrderAddDto } from './dtos/orders.add.dto';
import { DataSource } from 'typeorm';
import { OrderItems } from 'src/entitets/entities/OrderItems';
import { Items } from 'src/entitets/entities/Items';
import { GetCustomersDto } from '../customers/dtos/get.customers.dto';
import {
    ORDER_STATUS_TRANSITIONS,
    ORDER_STATUSES_REQUIRING_PAYMENT,
    OrderPaymentStatus,
    OrdersStatus,
} from './dtos/order.status.enum';
import { CacheIvalidationEvent } from 'src/common/events/cahce.events';
import { Customers } from 'src/entitets/entities/Customers';
import { Payments, PaymentStatus } from 'src/entitets/entities/Payments';
import { centsToMoney, moneyToCents } from 'src/utils/money.utils';
import { runInTransaction, txAbort } from 'src/misc/transaction.abort';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Orders) private readonly ordersEntitets: Repository<Orders>,
        @InjectRepository(Items) private readonly itemsEntitets: Repository<Items>,
        private dataSource: DataSource,
        private readonly eventEmmiter: EventEmitter2,
    ) {}

    private invalidateItemsCache(action: "create" | "update" | "delete"): void {
        this.eventEmmiter.emit(
            "cache.invalidate",
            new CacheIvalidationEvent(
                [],
                [
                    "administrator:*:/items/all",
                    "administrator:*:/items/*",
                    "superadministrator:*:/items/all",
                    "superadministrator:*:/items/*",
                    "customer:*:/items/all",
                    "customer:*:/items/*",
                    "customer:*:/customers",
                    "customer:*:/customers/order",
                    "administrator:*:/customers/*",
                    "superadministrator:*:/customers/*",
                ],
                "Items",
                action,
            ),
        );
    }

    async getAllOrders(): Promise<OrderGetAllDto[] | ApiResponse> {
        const getOrders = await this.ordersEntitets.find({ relations: ["customers", "orderItems"] });

        if (getOrders.length === 0) {
            return new ApiResponse("error", 404, "No Orders");
        }

        return getOrders.map(
            (data) =>
                new OrderGetAllDto(
                    data.orderId,
                    data.customerId,
                    data.orderStatus,
                    data.customers
                        ? new GetCustomersDto(
                              data.customers.customerId,
                              data.customers.customerName,
                              data.customers.isActive,
                              data.customers.contactEmail,
                              data.customers.phoneNumber,
                              data.customers.address,
                          )
                        : undefined,
                    data.paymentStatus,
                ),
        );
    }

    async getOrderById(id: number): Promise<OrderGetAllDto | ApiResponse> {
        const getOrder = await this.ordersEntitets.findOne({ where: { orderId: id } });

        if (!getOrder) {
            return new ApiResponse("error", 404, "No Order");
        }

        return new OrderGetAllDto(getOrder.orderId, getOrder.customerId, getOrder.orderStatus, undefined, getOrder.paymentStatus);
    }

    async getOrderStatus(orderStatus: string): Promise<OrderGetAllDto[] | ApiResponse> {
        const getOrders = await this.ordersEntitets.find({ where: { orderStatus: orderStatus } });

        if (getOrders.length === 0) {
            return new ApiResponse("error", 404, "No Orders with this status");
        }

        return getOrders.map(
            (data) => new OrderGetAllDto(data.orderId, data.customerId, data.orderStatus, undefined, data.paymentStatus),
        );
    }

    async changeOrderStatus(orderId: number, orderStatus: string): Promise<OrderGetAllDto | ApiResponse> {
        if (!Object.values(OrdersStatus).includes(orderStatus as OrdersStatus)) {
            return new ApiResponse("error", 400, "Invalid order status");
        }

        const nextStatus = orderStatus as OrdersStatus;

        if (nextStatus === OrdersStatus.CANCELLED) {
            return new ApiResponse("error", 403, "You cannot cancel an order via status change");
        }

        return await runInTransaction(this.dataSource, async (transactionalEntityManager) => {
            const order = await transactionalEntityManager.findOne(Orders, {
                where: { orderId: orderId },
                lock: { mode: "pessimistic_write" },
            });

            if (!order) {
                txAbort("error", 404, "No Order");
            }

            const currentStatus = order.orderStatus as OrdersStatus;
            const allowed = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];

            if (!allowed.includes(nextStatus)) {
                txAbort(
                    "error",
                    400,
                    `Cannot change order status from ${currentStatus} to ${nextStatus}`,
                );
            }

            if (
                ORDER_STATUSES_REQUIRING_PAYMENT.includes(nextStatus) &&
                order.paymentStatus !== OrderPaymentStatus.PAID
            ) {
                txAbort(
                    "error",
                    400,
                    `Cannot set order to ${nextStatus} before payment is marked as paid`,
                );
            }

            order.orderStatus = nextStatus;
            const savedOrder = await transactionalEntityManager.save(order);

            if (!savedOrder) {
                txAbort("error", 400, "Cannot change order status");
            }

            return new OrderGetAllDto(
                savedOrder.orderId,
                savedOrder.customerId,
                savedOrder.orderStatus,
                undefined,
                savedOrder.paymentStatus,
            );
        });
    }

    async getOrdersByCustomerId(customerId: number): Promise<OrderGetAllDto[] | ApiResponse> {
        const getOrders = await this.ordersEntitets.find({ where: { customerId: customerId } });

        if (getOrders.length === 0) {
            return new ApiResponse("error", 404, "No Orders for this customer");
        }

        return getOrders.map(
            (data) => new OrderGetAllDto(data.orderId, data.customerId, data.orderStatus, undefined, data.paymentStatus),
        );
    }

    async addOrder(order: OrderAddDto, userId: number): Promise<OrderGetAllDto | ApiResponse | any> {
        const result = await runInTransaction(this.dataSource, async (transactionalEntityManager) => {
            const customer = await transactionalEntityManager.findOne(Customers, {
                where: { customerId: userId, isActive: true },
                lock: { mode: "pessimistic_write" },
            });
            if (!customer) {
                txAbort("error", 403, "Customer is inactive or not found");
            }

            const quantityByItemId = new Map<number, number>();
            for (const item of order.items) {
                quantityByItemId.set(item.itemId, (quantityByItemId.get(item.itemId) ?? 0) + item.quantity);
            }

            const uniqueItemIds = [...quantityByItemId.keys()];
            const items = await transactionalEntityManager.find(Items, {
                where: uniqueItemIds.map((id) => ({ itemId: id })),
                lock: { mode: "pessimistic_write" },
            });

            if (items.length !== uniqueItemIds.length) {
                txAbort("error", 404, "One or more items not found");
            }

            const itemsById = new Map(items.map((item) => [item.itemId, item]));

            let totalCents = 0;
            for (const [itemId, quantity] of quantityByItemId) {
                const dbItem = itemsById.get(itemId)!;
                if (Number(dbItem.stockQuantity) < quantity) {
                    txAbort("error", 409, `Not enough stock for item ${itemId}`);
                }
                totalCents += moneyToCents(dbItem.price) * quantity;
            }

            if (totalCents <= 0) {
                txAbort("error", 400, "Order total must be greater than zero");
            }

            const orderCreate = transactionalEntityManager.create(Orders, {
                customerId: userId,
                orderStatus: OrdersStatus.PENDING,
                paymentmethod: order.paymentMethod,
                paymentStatus: OrderPaymentStatus.UNPAID,
            });

            const savedOrder = await transactionalEntityManager.save(orderCreate);

            const orderItems = [...quantityByItemId.entries()].map(([itemId, quantity]) => {
                const dbItem = itemsById.get(itemId)!;
                return transactionalEntityManager.create(OrderItems, {
                    orderId: savedOrder.orderId,
                    itemId,
                    orders: savedOrder,
                    items: dbItem,
                    quantity,
                    price: centsToMoney(moneyToCents(dbItem.price)),
                });
            });

            await transactionalEntityManager.save(OrderItems, orderItems);

            for (const [itemId, quantity] of quantityByItemId) {
                const qty = Number(quantity);
                const stockUpdate = await transactionalEntityManager
                    .createQueryBuilder()
                    .update(Items)
                    .set({ stockQuantity: () => `stock_quantity - ${qty}` })
                    .where("item_id = :itemId AND stock_quantity >= :quantity", { itemId, quantity: qty })
                    .execute();
                if (!stockUpdate.affected) {
                    txAbort("error", 409, `Not enough stock for item ${itemId}`);
                }
            }

            return new OrderGetAllDto(
                savedOrder.orderId,
                savedOrder.customerId,
                savedOrder.orderStatus,
                undefined,
                savedOrder.paymentStatus,
            );
        });

        if (!(result instanceof ApiResponse)) {
            this.invalidateItemsCache("update");
        }

        return result;
    }

    async delteOrderForCustomer(orderId: number, userId: number): Promise<ApiResponse> {
        const result = await runInTransaction(this.dataSource, async (transactionalEntityManager) => {
            const order = await transactionalEntityManager.findOne(Orders, {
                where: { orderId: orderId },
                lock: { mode: "pessimistic_write" },
            });

            if (!order) {
                txAbort("error", 404, "Order not found");
            }

            if (order.customerId !== userId) {
                txAbort("error", 403, "You can only delete your own orders");
            }

            if (
                order.orderStatus !== OrdersStatus.ACTIVE &&
                order.orderStatus !== OrdersStatus.PENDING
            ) {
                txAbort("error", 400, "Only active and pending orders can be deleted");
            }

            if (order.paymentStatus === OrderPaymentStatus.PAID) {
                txAbort(
                    "error",
                    400,
                    "Paid orders cannot be cancelled by the customer. Contact an administrator for a refund.",
                );
            }

            return await this.cancelOrder(transactionalEntityManager, order, { allowRefund: false });
        });

        if (result.status === "success") {
            this.invalidateItemsCache("update");
        }

        return result;
    }

    async deleteOrderForAdmin(orderId: number): Promise<ApiResponse> {
        const result = await runInTransaction(this.dataSource, async (transactionalEntityManager) => {
            const order = await transactionalEntityManager.findOne(Orders, {
                where: { orderId: orderId },
                lock: { mode: "pessimistic_write" },
            });

            if (!order) {
                txAbort("error", 404, "Order not found");
            }

            if (
                order.orderStatus !== OrdersStatus.ACTIVE &&
                order.orderStatus !== OrdersStatus.PENDING
            ) {
                txAbort("error", 400, "Only active and pending orders can be deleted");
            }

            return await this.cancelOrder(transactionalEntityManager, order, { allowRefund: true });
        });

        if (result.status === "success") {
            this.invalidateItemsCache("update");
        }

        return result;
    }

    /**
     * Cancels an order inside an existing transaction. Throws (via txAbort) on any
     * business failure so the caller's transaction rolls back — nothing is mutated
     * before validation passes.
     */
    async cancelOrder(
        transactionalEntityManager: EntityManager,
        order: Orders,
        opts: { allowRefund: boolean },
    ): Promise<ApiResponse> {
        if (order.paymentStatus === OrderPaymentStatus.PAID && !opts.allowRefund) {
            txAbort("error", 400, "Paid orders cannot be cancelled this way");
        }

        const orderItems = await transactionalEntityManager.find(OrderItems, {
            where: { orderId: order.orderId },
            lock: { mode: "pessimistic_write" },
        });

        if (orderItems.length === 0) {
            txAbort("error", 400, "Order has no items");
        }

        for (const orderItem of orderItems) {
            await transactionalEntityManager.increment(
                Items,
                { itemId: orderItem.itemId },
                "stockQuantity",
                orderItem.quantity,
            );
        }

        order.orderStatus = OrdersStatus.CANCELLED;
        if (order.paymentStatus === OrderPaymentStatus.PAID) {
            order.paymentStatus = OrderPaymentStatus.REFUNDED;
            const payment = await transactionalEntityManager.findOne(Payments, {
                where: { orderId: order.orderId },
                lock: { mode: "pessimistic_write" },
            });
            if (payment && payment.status === PaymentStatus.COMPLETED) {
                payment.status = PaymentStatus.REFUNDED;
                await transactionalEntityManager.save(payment);
            }
        }
        await transactionalEntityManager.save(order);

        return new ApiResponse("success", 7001, "Order cancelled successfully");
    }

    /**
     * Cancels stale pending + unpaid orders (releases reserved stock).
     * Returns the number of orders cancelled.
     */
    async cancelExpiredPendingOrders(ttlHours: number): Promise<number> {
        const cutoff = new Date(Date.now() - ttlHours * 60 * 60 * 1000);
        const stale = await this.ordersEntitets.find({
            select: { orderId: true },
            where: {
                orderStatus: OrdersStatus.PENDING,
                paymentStatus: OrderPaymentStatus.UNPAID,
                createdAt: LessThan(cutoff),
            },
        });

        let cancelled = 0;
        for (const { orderId } of stale) {
            const result = await runInTransaction(this.dataSource, async (manager) => {
                const order = await manager.findOne(Orders, {
                    where: { orderId },
                    lock: { mode: "pessimistic_write" },
                });

                // Re-check under lock: payment may have landed or status changed meanwhile.
                if (
                    !order ||
                    order.orderStatus !== OrdersStatus.PENDING ||
                    order.paymentStatus !== OrderPaymentStatus.UNPAID
                ) {
                    txAbort("error", 409, "Order is no longer eligible for expiry");
                }

                return await this.cancelOrder(manager, order, { allowRefund: false });
            });

            if (result.status === "success") {
                cancelled++;
            }
        }

        if (cancelled > 0) {
            this.invalidateItemsCache("update");
        }

        return cancelled;
    }

    async orderSnapshotJSON(orderId: number): Promise<string | ApiResponse> {
        const order = await this.ordersEntitets.findOne({
            where: { orderId },
            relations: { customers: true, orderItems: { items: true } },
        });
        if (!order) {
            return new ApiResponse("error", 404, "Order not found");
        }

        const snapshot = {
            orderId: order.orderId,
            customerId: order.customerId,
            orderStatus: order.orderStatus,
            paymentMethod: order.paymentmethod,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            customer: order.customers
                ? {
                      customerId: order.customers.customerId,
                      customerName: order.customers.customerName,
                      contactEmail: order.customers.contactEmail,
                  }
                : null,
            items: (order.orderItems ?? []).map((oi) => {
                const lineCents = moneyToCents(oi.price) * Number(oi.quantity);
                return {
                    orderItemId: oi.orderItemId,
                    itemId: oi.items?.itemId,
                    itemName: oi.items?.itemName,
                    quantity: oi.quantity,
                    price: centsToMoney(moneyToCents(oi.price)),
                    lineTotal: centsToMoney(lineCents),
                };
            }),
            total: centsToMoney(
                (order.orderItems ?? []).reduce(
                    (sum, oi) => sum + moneyToCents(oi.price) * Number(oi.quantity),
                    0,
                ),
            ),
        };

        return JSON.stringify(snapshot);
    }

    async orderSnapshotPDF(orderId: number): Promise<Buffer | ApiResponse> {
        const json = await this.orderSnapshotJSON(orderId);
        if (json instanceof ApiResponse) {
            return json;
        }
        // Lightweight text PDF alternative until a full PDF template exists.
        return Buffer.from(json, "utf8");
    }
}
