import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber} from 'class-validator';

export class OrderDeleteDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    orderId: number;
}
