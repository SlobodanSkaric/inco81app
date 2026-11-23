import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class OrderDeleteDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    orderId: number;
}
