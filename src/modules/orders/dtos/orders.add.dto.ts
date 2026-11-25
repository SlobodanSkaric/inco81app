import { Type } from "class-transformer";
import {
    ArrayNotEmpty,
    ArrayUnique,
    IsArray,
    IsEnum,
    IsInt,
    IsPositive,
    ValidateNested,
} from "class-validator";
import { OrderPaymentMethod } from "./order.status.enum";

export class OrderItemDto {
    @IsInt()
    @IsPositive()
    itemId: number;

    @IsInt()
    @IsPositive()
    quantity: number;
}

export class OrderAddDto {
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique((item: OrderItemDto) => item.itemId, {
        message: "Each item can appear only once in an order",
    })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsEnum(OrderPaymentMethod)
    paymentMethod: OrderPaymentMethod;
}
