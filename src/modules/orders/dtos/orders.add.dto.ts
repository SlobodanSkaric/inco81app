import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class OrderAddDto {
    @IsNumber()
    @IsNotEmpty()
    customerId: number;

    @IsString()
    @IsNotEmpty()
    orderStatus: string;

    @IsNumber()
    @IsNotEmpty()
    totalAmount: number;
}