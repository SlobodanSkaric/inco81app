import { Type } from "class-transformer";
import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from "class-validator";

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
    @ArrayUnique((item: OrderItemDto) => item.itemId, { message: "Each item can appear only once in an order" })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
