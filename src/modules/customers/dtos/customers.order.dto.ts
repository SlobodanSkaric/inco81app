export class CustomersOrderDto {
    orderId: number;
    orderStatus: string;
    paymentmethod: string;
    paymentStatus?: string;
    createdAt: Date;
    
    constructor(
        orderId: number,
        orderStatus: string,
        paymentmethod: string,
        createdAt: Date,
        paymentStatus?: string,
    ) {
        this.orderId = orderId;
        this.orderStatus = orderStatus;
        this.paymentmethod = paymentmethod;
        this.createdAt = createdAt;
        this.paymentStatus = paymentStatus;
    }
}
