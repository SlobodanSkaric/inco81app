import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddItemsDto {
    @IsString()
    @IsNotEmpty()
    itemName: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    @IsNotEmpty()
    stockQuantity: number;
}