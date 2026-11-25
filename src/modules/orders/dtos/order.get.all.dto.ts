import { GetCustomersDto } from "src/modules/customers/dtos/get.customers.dto";

export class OrderGetAllDto {
    orderId: number;
    customerId: number;
    orderStatus: string;
    customers?: GetCustomersDto;
    paymentStatus?: string;

    constructor(orderId: number, customerId: number, orderStatus: string, customers?: GetCustomersDto, paymentStatus?: string){
        this.orderId = orderId;
        this.customerId = customerId;
        this.orderStatus = orderStatus;
        this.customers = customers;
        this.paymentStatus = paymentStatus;
    }
}
