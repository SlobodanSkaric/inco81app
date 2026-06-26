import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customers } from 'entitets/entities/Customers';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';
import { GetCustomersDto } from './dtos/get.customers.dto';
import { AddCustomersDto } from './dtos/add.customers.dto';
import * as bcrypt from "bcrypt";
import { OrdersStatus } from '../orders/dtos/order.status.enum';

@Injectable()
export class CustomersService {
    constructor(@InjectRepository(Customers) private readonly customersRepository: Repository<Customers>) {}

    async findAllCustomers(): Promise<GetCustomersDto[] | ApiResponse> {
        try{
            const customers = await this.customersRepository.find();
            if(customers.length === 0){
                return new ApiResponse("error", -1101, "No customers found");
            }
            return customers.map(customer => new GetCustomersDto(
                customer.customerId,
                customer.customerName,
                customer.isActive,
                customer.contactEmail,
                customer.phoneNumber ? customer.phoneNumber : "",
                customer.address ? customer.address : ""
            ));
        }catch(error){
            return new ApiResponse("error", -1102, "Database query failed");
        }
    }

    async getByEmail(email: string): Promise<Customers | ApiResponse>{
        try{
            const customers = await this.customersRepository.findOne({ where : { contactEmail: email}});

            if(!customers){
                return new ApiResponse("error", -1107, "Customer not found");
            }
            
            return customers;
        }catch(error){
            return new ApiResponse("error", -1108, "Database query failed");
        }
    }

    async findCustomersById(customertsId: number): Promise<GetCustomersDto | ApiResponse>{
        try{
            const customer = await this.customersRepository.findOne({ where : { customerId: customertsId } });
            if(!customer){
                return new ApiResponse("error", -1103, "Customer not found");
            }

           return new GetCustomersDto(
                customer.customerId,
                customer.customerName,
                customer.isActive,
                customer.contactEmail,
                customer.phoneNumber ? customer.phoneNumber : "",
                customer.address ? customer.address : ""
            );
        }catch(error){
            return new ApiResponse("error", -1104, "Database query failed");
        }
    }

    async findCustomersOrdes(customersId: number): Promise<Customers | ApiResponse>{
        try{
            
            const customers = await this.customersRepository.createQueryBuilder("customers")
                .leftJoinAndSelect("customers.orders", "orders")
                .where("customers.customerId = :id", { id: customersId})
                .andWhere("orders.orderStatus = :statuses", { statuses: OrdersStatus.ACTIVE })
                .getOne();

            if(!customers){
                return new ApiResponse("error", -1103, "Customer not found");
            }

            return customers;
        }catch(error){
            return new ApiResponse("error", -1104, "Database query failed");
        }
    }

    async addCustomers(customer: AddCustomersDto): Promise<GetCustomersDto | ApiResponse>{
        try{

            const salt = 10;
            const cusromerEntity = new Customers();

            cusromerEntity.customerName = customer.customerName;
            cusromerEntity.password = await bcrypt.hash(customer.password, salt);
            cusromerEntity.isActive = customer.isActive;
            cusromerEntity.contactEmail = customer.contactEmail;
            cusromerEntity.phoneNumber = customer.phoneNumber;
            cusromerEntity.address = customer.address;

            const savedCustomer = await this.customersRepository.save(cusromerEntity);

            return new GetCustomersDto(
                savedCustomer.customerId,
                savedCustomer.customerName,
                savedCustomer.isActive,
                savedCustomer.contactEmail,
                savedCustomer.phoneNumber ? savedCustomer.phoneNumber : "",
                savedCustomer.address ? savedCustomer.address : ""
            );
        }catch(error){
            if(error.code === "ER_DUP_ENTRY"){
                return new ApiResponse("error", -1105, "Customer with this email already exists");
            }
            return new ApiResponse("error", -1106, "Database query failed");
        }
    }
}
