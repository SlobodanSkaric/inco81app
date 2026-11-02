import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OrderDeleteDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    orderId: number;

    @ApiProperty({ example: 'cancelled' })
    @IsNotEmpty()
    @IsString()
    status: string;
}
