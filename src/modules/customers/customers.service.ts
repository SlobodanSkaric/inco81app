import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Customers } from 'src/entitets/entities/Customers';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';
import { GetCustomersDto } from './dtos/get.customers.dto';
import { AddCustomersDto } from './dtos/add.customers.dto';
import * as bcrypt from "bcrypt";
import { OrdersStatus } from '../orders/dtos/order.status.enum';
import { GetCustomerOrdersDto } from './dtos/get.cstomers,orders.dto';
import { CustomersOrderDto } from './dtos/customers.order.dto';
import { CacheIvalidationEvent } from 'src/common/events/cahce.events';
import { SessionsRevokedEvent } from 'src/common/events/auth.events';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customers) private readonly customersRepository: Repository<Customers>,
        private readonly eventEmmiter: EventEmitter2,
    ) {}

    async findAllCustomers(): Promise<GetCustomersDto[] | ApiResponse> {
        try{
            const customers = await this.customersRepository.find();
            if(customers.length === 0){
                return new ApiResponse("error", 404, "No customers found");
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
            return new ApiResponse("error", 500, "Database query failed");
        }
    }

    async getByEmail(email: string): Promise<Customers | null>{
        try{
            const customers = await this.customersRepository.findOne({ where : { contactEmail: email.trim().toLowerCase() }});

            if(!customers){
                return null;
            }
            
            return customers;
        }catch(error){
            return null;
        }
    }

    async findCustomersById(customertsId: number): Promise<GetCustomersDto | ApiResponse>{
        try{
            const customer = await this.customersRepository.findOne({ where : { customerId: customertsId } });
            if(!customer){
                return new ApiResponse("error", 404, "Customer not found");
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
            return new ApiResponse("error", 500, "Database query failed");
        }
    }

    async findCustomersOrdes(customersId: number): Promise<GetCustomerOrdersDto | ApiResponse>{
        try{
            
            const customers = await this.customersRepository.createQueryBuilder("customers")
                .leftJoinAndSelect("customers.orders", "orders")
                .where("customers.customerId = :id", { id: customersId})
                .getOne();

            if(!customers){
                return new ApiResponse("error", 404, "Customer not found");
            }

            const visibleOrders = (customers.orders ?? []).filter(
                (order) => order.orderStatus !== OrdersStatus.CANCELLED,
            );

            return new GetCustomerOrdersDto(
                customers.customerId,
                customers.customerName,
                customers.isActive,
                customers.contactEmail,
                customers.phoneNumber ? customers.phoneNumber : "",
                customers.address ? customers.address : "",
                visibleOrders.map(order => new CustomersOrderDto(
                    order.orderId,
                    order.orderStatus,
                    order.paymentmethod,
                    order.createdAt,
                    order.paymentStatus,
                )),
            );
        }catch(error){
            return new ApiResponse("error", 500, "Database query failed");
        }
    }

    async addCustomers(customer: AddCustomersDto): Promise<GetCustomersDto | ApiResponse>{
        try{

            const salt = 10;
            const cusromerEntity = new Customers();

            cusromerEntity.customerName = customer.customerName;
            cusromerEntity.password = await bcrypt.hash(customer.password, salt);
            cusromerEntity.isActive = customer.isActive;
            cusromerEntity.contactEmail = customer.contactEmail.trim().toLowerCase();
            cusromerEntity.phoneNumber = customer.phoneNumber;
            cusromerEntity.address = customer.address;

            const savedCustomer = await this.customersRepository.save(cusromerEntity);

            this.eventEmmiter.emit("cache.invalidate",
                new CacheIvalidationEvent(
                    [],
                    [
                        "administrator:*:/customers/all",
                        "administrator:*:/customers/*",
                        "superadministrator:*:/customers/all",
                        "superadministrator:*:/customers/*",
                    ],
                    "Customers",
                    "create",
                )
            );

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
                return new ApiResponse("error", 409, "Customer with this email already exists");
            }
            return new ApiResponse("error", 500, "Database query failed");
        }
    }

    async findCustomerInActive(customerId: number): Promise<Customers | null>{
        try{
            const customer = await this.customersRepository.findOne({ where : { customerId: customerId, isActive: true } });
            if(!customer){
                return null;
            }
            return customer;
        }catch(error){
            return null;
        }
    }

    async setCustomerActive(customerId: number, isActive: boolean): Promise<GetCustomersDto | ApiResponse> {
        const customer = await this.customersRepository.findOne({ where: { customerId } });
        if (!customer) {
            return new ApiResponse("error", 404, "Customer not found");
        }
        if (customer.isActive === isActive) {
            return new ApiResponse("error", 409, "Customer already has this active state");
        }

        customer.isActive = isActive;
        const saved = await this.customersRepository.save(customer);

        if (!isActive) {
            await this.eventEmmiter.emitAsync(
                "auth.sessions.revoked",
                new SessionsRevokedEvent(saved.customerId.toString(), Role.CUSTOMER),
            );
        }

        this.eventEmmiter.emit(
            "cache.invalidate",
            new CacheIvalidationEvent(
                [],
                [
                    "administrator:*:/customers/all",
                    "administrator:*:/customers/*",
                    "superadministrator:*:/customers/all",
                    "superadministrator:*:/customers/*",
                    "customer:*:/customers",
                    "customer:*:/customers/order",
                ],
                "Customers",
                "update",
            ),
        );

        return new GetCustomersDto(
            saved.customerId,
            saved.customerName,
            saved.isActive,
            saved.contactEmail,
            saved.phoneNumber ?? "",
            saved.address ?? "",
        );
    }
}
