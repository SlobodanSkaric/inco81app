import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class AddItemsDto {
    @IsString()
    @IsNotEmpty()
    itemName: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsNotEmpty()
    @Min(0.01)
    price: number;

    @IsInt()
    @IsNotEmpty()
    @Min(0)
    stockQuantity: number;
}
