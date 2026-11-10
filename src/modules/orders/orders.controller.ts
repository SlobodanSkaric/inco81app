import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuards } from '../auth/jwtAuthGuards';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { OrderGetAllDto } from './dtos/order.get.all.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { OrderAddDto } from './dtos/orders.add.dto';
import { OrderDeleteDto } from './dtos/orders.delete';
import { Request } from 'express';
import { EditOrdersStatusDto } from './dtos/edit.orders.status.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService){

    }

    @ApiOperation({ summary: 'Get all orders' })
    @ApiAuth("administrator")
    @ApiResult(OrderGetAllDto, { isArray: true })
    @Get("/all")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getAllOrders(): Promise<OrderGetAllDto[] | ApiResponse>{
        return await this.ordersService.getAllOrders();
    }

    @ApiOperation({ summary: 'Get order by id' })
    @ApiAuth("administrator")
    @ApiResult(OrderGetAllDto)
    @Get("/:id")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getOrderById(@Param("id") id: number): Promise<OrderGetAllDto | ApiResponse>{
        return await this.ordersService.getOrderById(id);
    }

    @ApiOperation({ summary: 'Create order' })
    @ApiAuth("administrator", "customer")
    @ApiResult(OrderGetAllDto, { status: 201 })
    @Post("/createorders")
    @Roles("administrator", "customer")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async createOrder(@Body() order: OrderAddDto, @Req() req: Request): Promise<OrderGetAllDto | ApiResponse>{
        const userId = req.user.id;
        return await this.ordersService.addOrder(order, userId);
    }

    @ApiOperation({ summary: 'Delete (cancel) order' })
    @ApiAuth("administrator", "customer")
    @ApiResult(undefined, { status: 201 })
    @Post("/deleteorders")
    @Roles("administrator", "customer")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async deleteOrder(@Body() deleteData: OrderDeleteDto, @Req() req: Request): Promise<ApiResponse>{
        return await this.ordersService.delteOrder(deleteData.orderId, deleteData.status, req.user.id);
    }

    @ApiOperation({ summary: 'Change order status' })
    @ApiAuth("administrator")
    @ApiResult(OrderGetAllDto, { status: 201 })
    @Post("/changestatus/")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async changeOrderStatus(@Body() order: EditOrdersStatusDto): Promise<OrderGetAllDto | ApiResponse>{
        return await this.ordersService.changeOrderStatus(order.orderId, order.orderStatus);
    }
}
