import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from 'entitets/entities/Orders';
import { get } from 'http';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';
import { OrderGetAllDto } from './dtos/order.get.all.dto';
import { OrderAddDto } from './dtos/orders.add.dto';

@Injectable()
export class OrdersService {
    constructor(@InjectRepository(Orders) private readonly ordersEntitets: Repository<Orders>){}


    async getAllOrders(): Promise<OrderGetAllDto[] | ApiResponse>{
        const getOrders = await this.ordersEntitets.find(); //implement all relations and change dto

        if(getOrders.length === 0){
            return new ApiResponse("error", -7008, "No Orders");
        }

        const orders: OrderGetAllDto[] = [];

        getOrders.forEach((data) =>{
            orders.push(new OrderGetAllDto(data.orderId, data.customerId, data.orderStatus, data.totalAmount));
        });

        return orders;
    }

    async getOrderById(id: number): Promise<OrderGetAllDto | ApiResponse>{
        const getOrder = await this.ordersEntitets.findOne({ where: {orderId: id}}); //implement all relations and change dto

        if(!getOrder){
            return new ApiResponse("error", -7009, "No Order");
        }

        return new OrderGetAllDto(getOrder.orderId, getOrder.customerId, getOrder.orderStatus, getOrder.totalAmount);
    }


    async getOrderStatus(orderStatus: string): Promise<OrderGetAllDto[] | ApiResponse>{
        const getOrders = await this.ordersEntitets.find({ where: {orderStatus: orderStatus}}); //implement all relations and change dto

        if(getOrders.length === 0){
            return new ApiResponse("error", -7010, "No Orders with this status");
        }

        const orders: OrderGetAllDto[] = [];

        getOrders.forEach((data) =>{
            orders.push(new OrderGetAllDto(data.orderId, data.customerId, data.orderStatus, data.totalAmount));
        });

        return orders;
    }

    async changeOrderStatus(orderId: number, orderStatus: string): Promise<OrderGetAllDto | ApiResponse>{
        const order = await this.ordersEntitets.findOne({ where: {orderId: orderId}});

        if(!order){
            return new ApiResponse("error", -7012, "No Order");
        }

        order.orderStatus = orderStatus;

        const savedOrder = await this.ordersEntitets.save(order);

        if(!savedOrder){
            return new ApiResponse("error", -7013, "Cannot change order status");
        }

        return new OrderGetAllDto(savedOrder.orderId, savedOrder.customerId, savedOrder.orderStatus, savedOrder.totalAmount);
    }

    async getOrdersByCustomerId(customerId: number): Promise<OrderGetAllDto[] | ApiResponse>{
        const getOrders = await this.ordersEntitets.find({ where: {customerId: customerId}}); //implement all relations and change dto

        if(getOrders.length === 0){
            return new ApiResponse("error", -7011, "No Orders for this customer");
        }

        const orders: OrderGetAllDto[] = [];

        getOrders.forEach((data) =>{
            orders.push(new OrderGetAllDto(data.orderId, data.customerId, data.orderStatus, data.totalAmount));
        });

        return orders;
    }

    async addOrder(order: OrderAddDto): Promise<OrderGetAllDto | ApiResponse>{
        const orderEntitet = new Orders();
        orderEntitet.customerId = order.customerId;
        orderEntitet.orderStatus = order.orderStatus;
        orderEntitet.totalAmount = order.totalAmount;

        const savedOrder = await this.ordersEntitets.save(orderEntitet);

        if(!savedOrder){
            return new ApiResponse("error", -7014, "Cannot add order");
        }

        return new OrderGetAllDto(savedOrder.orderId, savedOrder.customerId, savedOrder.orderStatus, savedOrder.totalAmount);
    }

    async orderSnapshotJSON(orderId: number): Promise<string | ApiResponse | null>{ return null;}//implement order snapshot in json format
    async orderSnapshotPDF(orderId: number): Promise<Buffer | ApiResponse | null>{ return null;}//implement order snapshot in pdf format
}
