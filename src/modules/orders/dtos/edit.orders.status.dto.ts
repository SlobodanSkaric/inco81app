import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { OrdersStatus } from "src/modules/orders/dtos/order.status.enum";

export class EditOrdersStatusDto {
    @IsNotEmpty()
    @IsNumber()
    orderId: number;

    @IsNotEmpty()
    @IsEnum(OrdersStatus, { message: 'Invalid order status ' })
    orderStatus: OrdersStatus;
}