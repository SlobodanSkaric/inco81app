export class OrderGetAllDto {
    orderId: number;
    customerId: number;
    orderStatus: string;
    totalAmount: number;

    constructor(orderId: number, customerId: number, orderStatus: string, totalAmount: number){
        this.orderId = orderId;
        this.customerId = customerId;
        this.orderStatus = orderStatus;
        this.totalAmount = totalAmount;
    }
}