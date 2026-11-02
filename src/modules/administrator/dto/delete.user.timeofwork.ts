import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class DeleteUserTimeOfWorkDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    timeOfWorkeId: number;

    @ApiProperty({ example: 0 })
    @IsNumber()
    @IsNotEmpty()
    status: number;
}
