import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class UpdateItemsDto {
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    itemId: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    price?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    stockQuantity?: number;
}
