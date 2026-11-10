import { IsArray, IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";

export class OrderItemDto {
    itemId: number;
    quantity: number;
}

export class OrderAddDto {

    @IsString()
    @IsNotEmpty()
    orderStatus: string = "active";

    @IsArray()
    items: OrderItemDto[];
}
