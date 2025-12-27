import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customers } from 'entitets/entities/Customers';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';

@Injectable()
export class CustomersService {
    constructor(@InjectRepository(Customers) private readonly customersRepository: Repository<Customers>) {}

    async findAllCustomers(): Promise<Customers[] | ApiResponse> {
        try{
            const customers = await this.customersRepository.find();
            if(customers.length === 0){
                return new ApiResponse("error", -1101, "No customers found");
            }
            return customers;
        }catch(error){
            return new ApiResponse("error", -1102, "Database query failed");
        }
    }

    async findCustomersById(customertsId: number): Promise<Customers | ApiResponse>{
        try{
            const customer = await this.customersRepository.findOne({ where : { customerId: customertsId } });
            if(!customer){
                return new ApiResponse("error", -1103, "Customer not found");
            }

            return customer
        }catch(error){
            return new ApiResponse("error", -1104, "Database query failed");
        }
    }
}
