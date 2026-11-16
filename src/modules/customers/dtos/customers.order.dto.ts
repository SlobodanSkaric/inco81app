export class CustomersOrderDto {
    orderId: number;
    orderStatus: string;
    paymentmethod: string;
    createdAt: Date;
    
    constructor(orderId: number, orderStatus: string, paymentmethod: string, createdAt: Date) {
        this.orderId = orderId;
        this.orderStatus = orderStatus;
        this.paymentmethod = paymentmethod;
        this.createdAt = createdAt;
    }
}