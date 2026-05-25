import { IsArray, IsNotEmpty, IsNumber, IsObject, IsString } from "class-validator";
export class OrderAddDto {
    @IsNumber()
    @IsNotEmpty()
    customerId: number;

    @IsString()
    @IsNotEmpty()
    orderStatus: string = "active";

    @IsArray()
    items:[{
        itemId: number;
        quantity: number;
    }];
}