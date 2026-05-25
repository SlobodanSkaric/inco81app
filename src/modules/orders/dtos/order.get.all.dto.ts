export class OrderGetAllDto {
    orderId: number;
    customerId: number;
    orderStatus: string;

    constructor(orderId: number, customerId: number, orderStatus: string){
        this.orderId = orderId;
        this.customerId = customerId;
        this.orderStatus = orderStatus;
    }
}