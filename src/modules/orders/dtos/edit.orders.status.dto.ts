import { IsEnum, IsInt, IsNotEmpty, IsPositive } from "class-validator";
import { OrdersStatus } from "src/modules/orders/dtos/order.status.enum";

export class EditOrdersStatusDto {
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    orderId: number;

    @IsNotEmpty()
    @IsEnum(OrdersStatus, { message: 'Invalid order status ' })
    orderStatus: OrdersStatus;
}