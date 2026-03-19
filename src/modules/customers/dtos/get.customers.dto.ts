export class GetCustomersDto {
    customerId: number;
    customerName: string;
    isActive: boolean;
    contactEmail: string;
    phoneNumber: string;
    address: string;

    constructor(customerId: number, customerName: string, isActive: boolean, contactEmail: string, phoneNumber: string, address: string) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.isActive = isActive;
        this.contactEmail = contactEmail;
        this.phoneNumber = phoneNumber;
        this.address = address;
    }
}