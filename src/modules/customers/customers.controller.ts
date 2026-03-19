import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Roles } from 'src/common/decorators/role.decorators';
import { JwtAuthGuards } from '../auth/jwtAuthGuards';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { AddCustomersDto } from './dtos/add.customers.dto';
import { GetCustomersDto } from './dtos/get.customers.dto';
import { ApiResponse } from 'src/misc/api.response.dto';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}
    
    @Get("all")
    @Roles("administrator", "superadministrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getAllCustomers() {
        return await this.customersService.findAllCustomers();
    }

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
