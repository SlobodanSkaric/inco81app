import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from 'src/common/decorators/role.decorators';
import { JwtAuthGuards } from '../auth/jwtAuthGuards';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { OrderGetAllDto } from './dtos/order.get.all.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { OrderAddDto } from './dtos/orders.add.dto';

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
    @Roles("administrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async createOrder(@Body() order: OrderAddDto): Promise<OrderGetAllDto | ApiResponse>{
        return await this.ordersService.addOrder(order);
    }
}
