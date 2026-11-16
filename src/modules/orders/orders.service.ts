import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from 'src/entitets/entities/Orders';
import { get } from 'http';
import { ApiResponse } from 'src/misc/api.response.dto';
import { EntityManager, Repository } from 'typeorm';
import { OrderGetAllDto } from './dtos/order.get.all.dto';
import { OrderAddDto } from './dtos/orders.add.dto';
import { DataSource } from 'typeorm';
import { OrderItems } from 'src/entitets/entities/OrderItems';
import { Items } from 'src/entitets/entities/Items';
import { Request } from 'express';
import { GetCustomersDto } from '../customers/dtos/get.customers.dto';
import { OrdersStatus } from './dtos/order.status.enum';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Orders) private readonly ordersEntitets: Repository<Orders>,
        @InjectRepository(Items) private readonly itemsEntitets: Repository<Items>,
        private dataSource: DataSource
    ){}


    async getAllOrders(): Promise<OrderGetAllDto[] | ApiResponse>{
        const getOrders = await this.ordersEntitets.find({ relations: ["customers", "orderItems"] }); 


        if(getOrders.length === 0){
            return new ApiResponse("error", 404, "No Orders");
        }

        const orders: OrderGetAllDto[] = [];

        getOrders.forEach((data) =>{
            orders.push(new OrderGetAllDto(data.orderId, data.customerId, data.orderStatus, new GetCustomersDto(data.customers["customerId"], data.customers["customerName"], data.customers["isActive"], data.customers["contactEmail"], data.customers["phoneNumber"], data.customers["address"])));
        });

        return orders;
    }

    async getOrderById(id: number): Promise<OrderGetAllDto | ApiResponse>{
        const getOrder = await this.ordersEntitets.findOne({ where: {orderId: id}}); //implement all relations and change dto

        if(!getOrder){
            return new ApiResponse("error", 404, "No Order");
        }

        return new OrderGetAllDto(getOrder.orderId, getOrder.customerId, getOrder.orderStatus);
    }


    async getOrderStatus(orderStatus: string): Promise<OrderGetAllDto[] | ApiResponse>{
        const getOrders = await this.ordersEntitets.find({ where: {orderStatus: orderStatus}}); //implement all relations and change dto

        if(getOrders.length === 0){
            return new ApiResponse("error", 404, "No Orders with this status");
        }

        const orders: OrderGetAllDto[] = [];

        getOrders.forEach((data) =>{
            orders.push(new OrderGetAllDto(data.orderId, data.customerId, data.orderStatus));
        });

        return orders;
    }

    async changeOrderStatus(orderId: number, orderStatus: string): Promise<OrderGetAllDto | ApiResponse>{
        const order = await this.ordersEntitets.findOne({ where: {orderId: orderId}});

        if(!order){
            return new ApiResponse("error", 404, "No Order");
        }

        if(!Object.values(OrdersStatus).includes(orderStatus as OrdersStatus)){
            return new ApiResponse("error", 400, "Invalid order status");
        }

        if(orderStatus === OrdersStatus.CANCELLED){
            return new ApiResponse("error", 403, "You cannot cancel an order");
        }

        if(order.orderStatus === OrdersStatus.CANCELLED){
            return new ApiResponse("error", 409, "Order is already cancelled");
        }

        order.orderStatus = orderStatus;

        const savedOrder = await this.ordersEntitets.save(order);

        if(!savedOrder){
            return new ApiResponse("error", 400, "Cannot change order status");
        }

        return new OrderGetAllDto(savedOrder.orderId, savedOrder.customerId, savedOrder.orderStatus);
    }

    async getOrdersByCustomerId(customerId: number): Promise<OrderGetAllDto[] | ApiResponse>{
        const getOrders = await this.ordersEntitets.find({ where: {customerId: customerId}}); //implement all relations and change dto

        if(getOrders.length === 0){
            return new ApiResponse("error", 404, "No Orders for this customer");
        }

        const orders: OrderGetAllDto[] = [];

        getOrders.forEach((data) =>{
            orders.push(new OrderGetAllDto(data.orderId, data.customerId, data.orderStatus));
        });

        return orders;
    }

    async addOrder(order: OrderAddDto, userId: number): Promise<OrderGetAllDto | ApiResponse | any>{
        return await this.dataSource.transaction(async(transactionalEntityManager) => {
            const itemsId = order.items.map(item => item.itemId);

            const items = await transactionalEntityManager.find(Items, {
                where: itemsId.map(id => ({ itemId: id })),
                lock: { mode: "pessimistic_write" }
            });

            if(items.length !== order.items.length){
                return new ApiResponse("error", 404, "One or more items not found");
            }

            const itemsById = new Map(items.map(item => [item.itemId, item]));

            for(const item of order.items){
                if(itemsById.get(item.itemId)!.stockQuantity < item.quantity){
                    return new ApiResponse("error", 409, `Not enough stock for item ${item.itemId}`);
                }
            }

            
            const orderCreate = transactionalEntityManager.create(Orders, {
                customerId: userId,
                orderStatus: OrdersStatus.ACTIVE
            });

            const savedOrder = await transactionalEntityManager.save(orderCreate);

            const orderItems = order.items.map(item => {
                const dbItem = itemsById.get(item.itemId);
                const orderItemsObjects = new OrderItems();
                orderItemsObjects.orders = savedOrder.orderId;
                orderItemsObjects.items = item.itemId;
                orderItemsObjects.quantity = item.quantity;
                // dbItem is guaranteed to exist because we checked lengths above
                orderItemsObjects.price = dbItem!.price;
                return orderItemsObjects;
            });

            await transactionalEntityManager.save(OrderItems, orderItems);

            for(const item of order.items){
                await transactionalEntityManager.decrement(Items, { itemId: item.itemId }, "stockQuantity", item.quantity);
            }

            return savedOrder;
        });
    }

    async delteOrderForCustomer(orderId: number,  userId: number): Promise<ApiResponse>{
        return await this.dataSource.transaction(async(transactionalEntityManager) => {
            const order = await transactionalEntityManager.findOne(Orders, {
                where: { orderId: orderId },
                lock: { mode: "pessimistic_write" }
            });

            if(!order){
                return new ApiResponse("error", 404, "Order not found");        
            }

            if(order.customerId !== userId){
                return new ApiResponse("error", 403, "You can only delete your own orders");
            }

            if(order.orderStatus !== OrdersStatus.ACTIVE && order.orderStatus !== OrdersStatus.PENDING){
                return new ApiResponse("error", 400, "Only active and pending orders can be deleted");
            }

            return await this.cancelOrder(transactionalEntityManager, order);

        });
    }

    async deleteOrderForAdmin(orderId: number): Promise<ApiResponse>{
        return await this.dataSource.transaction(async(transactionalEntityManager) => {
            const order = await transactionalEntityManager.findOne(Orders, {
                where: { orderId: orderId },
                lock: { mode: "pessimistic_write" }
            });

            if(!order){
                return new ApiResponse("error", 404, "Order not found");
            }

            if(order.orderStatus !== OrdersStatus.ACTIVE && order.orderStatus !== OrdersStatus.PENDING){
                return new ApiResponse("error", 400, "Only active and pending orders can be deleted");
            }

            return await this.cancelOrder(transactionalEntityManager, order);
        });
    }


    private async cancelOrder(transactionalEntityManager: EntityManager, order: Orders): Promise<ApiResponse>{
        const orderItems = await transactionalEntityManager.find(OrderItems,{
            where: { orders: order.orderId },
            loadRelationIds: true,
            lock: { mode: "pessimistic_write" }
        });

        if(orderItems.length === 0){
            return new ApiResponse("error", 400, "Order has no items");
        }

        for(const orderItem of orderItems){
            await transactionalEntityManager.increment(Items, { itemId: orderItem.items}, "stockQuantity", orderItem.quantity);
        }

        await transactionalEntityManager.delete(OrderItems, { orders: order.orderId });

        order.orderStatus = OrdersStatus.CANCELLED;
        await transactionalEntityManager.save(order);

        return new ApiResponse("success", 7001, "Order cancelled successfully");
    }

    async orderSnapshotJSON(orderId: number): Promise<string | ApiResponse | null>{ return null;}//implement order snapshot in json format
    async orderSnapshotPDF(orderId: number): Promise<Buffer | ApiResponse | null>{ return null;}//implement order snapshot in pdf format
}
