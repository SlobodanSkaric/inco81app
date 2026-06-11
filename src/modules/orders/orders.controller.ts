import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from 'src/common/decorators/role.decorators';
import { JwtAuthGuards } from '../auth/jwtAuthGuards';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { OrderGetAllDto } from './dtos/order.get.all.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { OrderAddDto } from './dtos/orders.add.dto';
import { OrderDeleteDto } from './dtos/orders.delete';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService){

    }

    @Get("/all")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getAllOrders(): Promise<OrderGetAllDto[] | ApiResponse>{
        return await this.ordersService.getAllOrders();
    }

    @Get("/:id")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getOrderById(@Param("id") id: number): Promise<OrderGetAllDto | ApiResponse>{
        return await this.ordersService.getOrderById(id);
    }

    @Post("/createorders")
    @Roles("administrator", "customer")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async createOrder(@Body() order: OrderAddDto): Promise<OrderGetAllDto | ApiResponse>{
        return await this.ordersService.addOrder(order);
    }

    @Post("/deleteorders")
    @Roles("administrator", "customer")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async deleteOrder(@Body() deleteData: OrderDeleteDto, @Req() req: Request): Promise<ApiResponse>{
        return await this.ordersService.delteOrder(deleteData.orderId, deleteData.status, req.user.id);
    }
}
