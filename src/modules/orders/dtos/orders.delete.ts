import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OrderDeleteDto {
    @IsNotEmpty()
    @IsNumber()
    orderId: number;

    @IsNotEmpty()
    @IsString()
    status: string;
}