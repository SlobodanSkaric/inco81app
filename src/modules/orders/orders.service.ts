import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from 'entitets/entities/Orders';
import { get } from 'http';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';
import { OrderGetAllDto } from './dtos/order.get.all.dto';
import { OrderAddDto } from './dtos/orders.add.dto';
import { DataSource } from 'typeorm';
import { OrderItems } from 'entitets/entities/OrderItems';
import { Items } from 'entitets/entities/Items';
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

        //console.log(getOrders);

        if(getOrders.length === 0){
            return new ApiResponse("error", -7008, "No Orders");
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
            return new ApiResponse("error", -7009, "No Order");
        }

        return new OrderGetAllDto(getOrder.orderId, getOrder.customerId, getOrder.orderStatus);
    }


    async getOrderStatus(orderStatus: string): Promise<OrderGetAllDto[] | ApiResponse>{
        const getOrders = await this.ordersEntitets.find({ where: {orderStatus: orderStatus}}); //implement all relations and change dto

        if(getOrders.length === 0){
            return new ApiResponse("error", -7010, "No Orders with this status");
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
            return new ApiResponse("error", -7012, "No Order");
        }

        if(!Object.values(OrdersStatus).includes(orderStatus as OrdersStatus)){
            return new ApiResponse("error", -7011, "Invalid order status");
        }

        order.orderStatus = orderStatus;

        const savedOrder = await this.ordersEntitets.save(order);

        if(!savedOrder){
            return new ApiResponse("error", -7013, "Cannot change order status");
        }

        return new OrderGetAllDto(savedOrder.orderId, savedOrder.customerId, savedOrder.orderStatus);
    }

    async getOrdersByCustomerId(customerId: number): Promise<OrderGetAllDto[] | ApiResponse>{
        const getOrders = await this.ordersEntitets.find({ where: {customerId: customerId}}); //implement all relations and change dto

        if(getOrders.length === 0){
            return new ApiResponse("error", -7011, "No Orders for this customer");
        }

        const orders: OrderGetAllDto[] = [];

        getOrders.forEach((data) =>{
            orders.push(new OrderGetAllDto(data.orderId, data.customerId, data.orderStatus));
        });

        return orders;
    }

    async addOrder(order: OrderAddDto): Promise<OrderGetAllDto | ApiResponse | any>{
        return await this.dataSource.transaction(async(transactionalEntityManager) => {
            const itemsId = order.items.map(item => item.itemId);

            const items = await transactionalEntityManager.find(Items, {
                where: itemsId.map(id => ({ itemId: id }))  
            });

            if(items.length !== order.items.length){
                return new ApiResponse("error", -7014, "One or more items not found");
            }

            const itemsById = new Map(items.map(item => [item.itemId, item]));

            
            const orderCreate = transactionalEntityManager.create(Orders, {
                customerId: order.customerId,
                orderStatus: order.orderStatus
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
            return savedOrder;
        });
    }

    async delteOrder(orderId: number, status: string, userId: number): Promise<ApiResponse>{
        const order = await this.ordersEntitets.findOne({ where: { orderId: orderId } });

        if(!order){
            return new ApiResponse("error", -7015, "Order not found");        
        }

        if(order.customerId !== userId){
            return new ApiResponse("error", -7016, "You can only delete your own orders");
        }

        if(order.orderStatus !== "active"){
            return new ApiResponse("error", -7017, "Only active orders can be deleted");
        }

        order.orderStatus = status;

        const savedOrder = await this.ordersEntitets.save(order);

        if(!savedOrder){
            return new ApiResponse("error", -7018, "Cannot delete order");
        }

        return new ApiResponse("success", 7001, "Order deleted successfully");
    }

   /* async checkedItemPrice(itemId: number, customersPrice: number): Promise<boolean>{
        const itemsRepository = await this.itemsEntitets.findOne({ where: { itemId: itemId }});

        if(!itemsRepository){
            return false
        }

        return itemsRepository.price === customersPrice;
    }*/

    async orderSnapshotJSON(orderId: number): Promise<string | ApiResponse | null>{ return null;}//implement order snapshot in json format
    async orderSnapshotPDF(orderId: number): Promise<Buffer | ApiResponse | null>{ return null;}//implement order snapshot in pdf format
}
