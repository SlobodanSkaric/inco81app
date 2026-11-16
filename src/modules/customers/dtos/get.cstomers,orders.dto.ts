import { CustomersOrderDto } from "./customers.order.dto";

export class GetCustomerOrdersDto {
    customerId: number;
    customerName: string;
    isActive: boolean;
    contactEmail: string;
    phoneNumber: string;
    address: string;
    orders: CustomersOrderDto[];

    constructor(
        customerId: number,
        customerName: string,
        isActive: boolean,
        contactEmail: string,
        phoneNumber: string,
        address: string,
        orders: CustomersOrderDto[],
    ) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.isActive = isActive;
        this.contactEmail = contactEmail;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.orders = orders;
    }
}