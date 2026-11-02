import { Body, Controller, Get, Param, Post, UseGuards,Req, UseInterceptors } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuards } from '../auth/jwtAuthGuards';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { AddCustomersDto } from './dtos/add.customers.dto';
import { GetCustomersDto } from './dtos/get.customers.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import {Request} from 'express';
import { Customers } from 'src/entitets/entities/Customers';
import { CacheRedisIntrceptor } from 'src/common/interceptors/cache.redis.interceptors';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';

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
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getAllCustomers() {
        return await this.customersService.findAllCustomers();
    }


    @ApiOperation({ summary: 'Get logged-in customer profile' })
    @ApiAuth("customer")
    @ApiResult(GetCustomersDto)
    @UseInterceptors(CacheRedisIntrceptor)
    @Get("")
    @Roles("customer")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getCustomer(@Req() req: Request): Promise<GetCustomersDto | ApiResponse | any>{
        return await this.customersService.findCustomersById(req.user.id);
    }

    @ApiOperation({ summary: 'Get logged-in customer with orders' })
    @ApiAuth("customer")
    @ApiResult(Customers)
    @Get("order")
    @Roles("customer")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getCustomerWithOrders(@Req() req: Request): Promise<Customers | ApiResponse | any>{
        return await this.customersService.findCustomersOrdes(req.user.id);
    }

    @ApiOperation({ summary: 'Get customer by id' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(GetCustomersDto)
    @UseInterceptors(CacheRedisIntrceptor)
    @Get(":id")
    @Roles("administrator", "superadministrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getCustomerById(@Param("id") id: number) {
        return await this.customersService.findCustomersById(id);
    }

    @ApiOperation({ summary: 'Create customer' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(GetCustomersDto, { status: 201 })
    @Post("save")
    @Roles("administrator", "superadministrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async addCustomer(@Body() customer: AddCustomersDto): Promise<GetCustomersDto | ApiResponse> {
        return await this.customersService.addCustomers(customer);
    }
}
