import { Body, Controller, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from 'src/common/decorators/role.decorator';
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
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(OrderGetAllDto, { isArray: true })
    @Get("/all")
    @Roles("administrator", "superadministrator")
    async getAllOrders(): Promise<OrderGetAllDto[] | ApiResponse>{
        return await this.ordersService.getAllOrders();
    }

    @ApiOperation({ summary: 'Get order by id' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(OrderGetAllDto)
    @Get("/:id")
    @Roles("administrator", "superadministrator")
    async getOrderById(@Param("id", ParseIntPipe) id: number): Promise<OrderGetAllDto | ApiResponse>{
        return await this.ordersService.getOrderById(id);
    }

    @ApiOperation({ summary: 'Create order' })
    @ApiAuth( "customer")
    @ApiResult(OrderGetAllDto, { status: 201 })
    @Post("/createorders")
    @Roles("customer")
    async createOrder(@Body() order: OrderAddDto, @Req() req: Request): Promise<OrderGetAllDto | ApiResponse>{
        const userId = req.user.id;
        return await this.ordersService.addOrder(order, userId);
    }

    @ApiOperation({ summary: 'Delete (cancel) order' })
    @ApiAuth("customer")
    @ApiResult(undefined, { status: 201 })
    @Post("/deleteorders")
    @Roles("customer")
    async deleteOrderForCustomer(@Body() deleteData: OrderDeleteDto, @Req() req: Request): Promise<ApiResponse>{
        return await this.ordersService.delteOrderForCustomer(deleteData.orderId, req.user.id);
    }

    @ApiOperation({ summary: 'Change order status' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(OrderGetAllDto, { status: 201 })
    @Post("/changestatus/")
    @Roles("administrator", "superadministrator")
    async changeOrderStatus(@Body() order: EditOrdersStatusDto): Promise<OrderGetAllDto | ApiResponse>{
        return await this.ordersService.changeOrderStatus(order.orderId, order.orderStatus);
    }
    
    @ApiOperation({ summary: 'Delete order for admin' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(undefined, { status: 201 })
    @Post("/deleteorders/admin")
    @Roles("administrator", "superadministrator")
    async deleteOrderForAdmin(@Body() deleteData: OrderDeleteDto): Promise<ApiResponse>{
        return await this.ordersService.deleteOrderForAdmin(deleteData.orderId);
    }
}
