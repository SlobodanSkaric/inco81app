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

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}
    
    @UseInterceptors(CacheRedisIntrceptor)
    @Get("all")
    @Roles("administrator", "superadministrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getAllCustomers() {
        return await this.customersService.findAllCustomers();
    }


    @UseInterceptors(CacheRedisIntrceptor)
    @Get("")
    @Roles("customer")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getCustomer(@Req() req: Request): Promise<GetCustomersDto | ApiResponse | any>{
        return await this.customersService.findCustomersById(req.user.id);
    }

    @Get("order")
    @Roles("customer")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getCustomerWithOrders(@Req() req: Request): Promise<Customers | ApiResponse | any>{
        return await this.customersService.findCustomersOrdes(req.user.id);
    }

    @UseInterceptors(CacheRedisIntrceptor)
    @Get(":id")
    @Roles("administrator", "superadministrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getCustomerById(@Param("id") id: number) {
        return await this.customersService.findCustomersById(id);
    }

    @Post("save")
    @Roles("administrator", "superadministrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async addCustomer(@Body() customer: AddCustomersDto): Promise<GetCustomersDto | ApiResponse> {
        return await this.customersService.addCustomers(customer);
    }
}
