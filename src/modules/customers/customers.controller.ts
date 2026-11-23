import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseInterceptors } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { AddCustomersDto } from './dtos/add.customers.dto';
import { GetCustomersDto } from './dtos/get.customers.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import {Request} from 'express';
import { Customers } from 'src/entitets/entities/Customers';
import { CacheRedisIntrceptor } from 'src/common/interceptors/cache.redis.interceptor';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';
import { GetCustomerOrdersDto } from './dtos/get.cstomers,orders.dto';
import { SetCustomerActiveDto } from './dtos/set.customer.active.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}
    
    @ApiOperation({ summary: 'Get all customers' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(GetCustomersDto, { isArray: true })
    @UseInterceptors(CacheRedisIntrceptor)
    @Get("all")
    @Roles("administrator", "superadministrator")
    async getAllCustomers() {
        return await this.customersService.findAllCustomers();
    }


    @ApiOperation({ summary: 'Get logged-in customer profile' })
    @ApiAuth("customer")
    @ApiResult(GetCustomersDto)
    @UseInterceptors(CacheRedisIntrceptor)
    @Get("")
    @Roles("customer")
    async getCustomer(@Req() req: Request): Promise<GetCustomersDto | ApiResponse | any>{
        return await this.customersService.findCustomersById(req.user.id);
    }

    @ApiOperation({ summary: 'Get logged-in customer with orders' })
    @ApiAuth("customer")
    @ApiResult(GetCustomerOrdersDto)
    @Get("order")
    @Roles("customer")
    async getCustomerWithOrders(@Req() req: Request): Promise<GetCustomerOrdersDto | ApiResponse | any>{
        return await this.customersService.findCustomersOrdes(req.user.id);
    }

    @ApiOperation({ summary: 'Get customer by id' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(GetCustomersDto)
    @UseInterceptors(CacheRedisIntrceptor)
    @Get(":id")
    @Roles("administrator", "superadministrator")
    async getCustomerById(@Param("id", ParseIntPipe) id: number) {
        return await this.customersService.findCustomersById(id);
    }

    @ApiOperation({ summary: 'Create customer' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(GetCustomersDto, { status: 201 })
    @Post("save")
    @Roles("administrator", "superadministrator")
    async addCustomer(@Body() customer: AddCustomersDto): Promise<GetCustomersDto | ApiResponse> {
        return await this.customersService.addCustomers(customer);
    }

    @ApiOperation({ summary: 'Activate or deactivate customer' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(GetCustomersDto, { status: 201 })
    @Post("set-active")
    @Roles("administrator", "superadministrator")
    async setCustomerActive(
        @Body() body: SetCustomerActiveDto,
    ): Promise<GetCustomersDto | ApiResponse> {
        return await this.customersService.setCustomerActive(body.customerId, body.isActive);
    }
}
