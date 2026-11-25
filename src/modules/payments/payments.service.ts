import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payments, PaymentStatus } from 'src/entitets/entities/Payments';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Orders } from 'src/entitets/entities/Orders';
import { OrderItems } from 'src/entitets/entities/OrderItems';
import { OrderPaymentStatus, OrdersStatus } from '../orders/dtos/order.status.enum';
import { centsToMoney, moneyToCents } from 'src/utils/money.utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheIvalidationEvent } from 'src/common/events/cahce.events';
import { runInTransaction, txAbort } from 'src/misc/transaction.abort';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly eventEmmiter: EventEmitter2,
    ) {}

    /**
     * Atomically marks an order as paid and records a payment row linked by order_id.
     * Payment provider integration is intentionally left for a later phase —
     * this method only keeps DB state consistent.
     */
    async markOrderAsPaid(
        orderId: number,
        opts?: { userId?: number; note?: string },
    ): Promise<Orders | ApiResponse> {
        if (opts?.userId == null) {
            return new ApiResponse("error", 400, "Staff userId is required to record payment");
        }

        const result = await runInTransaction(this.dataSource, async (manager) => {
            const order = await manager.findOne(Orders, {
                where: { orderId },
                lock: { mode: "pessimistic_write" },
            });
            if (!order) {
                txAbort("error", 404, "Order not found");
            }
            if (order.orderStatus === OrdersStatus.CANCELLED) {
                txAbort("error", 400, "Cannot pay a cancelled order");
            }
            if (order.paymentStatus === OrderPaymentStatus.PAID) {
                txAbort("error", 409, "Order is already paid");
            }

            const existingPayment = await manager.findOne(Payments, {
                where: { orderId },
                lock: { mode: "pessimistic_write" },
            });
            if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
                txAbort("error", 409, "Payment already recorded for this order");
            }

            const orderItems = await manager.find(OrderItems, {
                where: { orderId },
                lock: { mode: "pessimistic_write" },
            });
            if (orderItems.length === 0) {
                txAbort("error", 400, "Order has no items");
            }

            let totalCents = 0;
            for (const oi of orderItems) {
                totalCents += moneyToCents(oi.price) * Number(oi.quantity);
            }
            if (totalCents <= 0) {
                txAbort("error", 400, "Order total must be greater than zero");
            }

            order.paymentStatus = OrderPaymentStatus.PAID;
            const savedOrder = await manager.save(order);

            const amount = centsToMoney(totalCents);
            if (existingPayment) {
                existingPayment.userId = opts.userId!;
                existingPayment.amount = amount;
                existingPayment.descriptions = `Order #${orderId}`;
                existingPayment.paymentDate = new Date();
                existingPayment.status = PaymentStatus.COMPLETED;
                existingPayment.note = opts.note ?? null;
                await manager.save(existingPayment);
            } else {
                const payment = manager.create(Payments, {
                    userId: opts.userId!,
                    orderId,
                    amount,
                    descriptions: `Order #${orderId}`,
                    paymentDate: new Date(),
                    status: PaymentStatus.COMPLETED,
                    note: opts.note ?? null,
                });
                await manager.save(payment);
            }

            return savedOrder;
        });

        if (!(result instanceof ApiResponse)) {
            this.eventEmmiter.emit(
                "cache.invalidate",
                new CacheIvalidationEvent(
                    [],
                    [
                        "administrator:*:/orders/*",
                        "superadministrator:*:/orders/*",
                        "customer:*:/customers",
                        "customer:*:/customers/order",
                    ],
                    "Payments",
                    "update",
                ),
            );
        }

        return result;
    }
}
