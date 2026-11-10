import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class GetHorseDto{
    @IsNumber()
    @IsPositive()
    @IsOptional()
    userId?: number;

    @IsString()
    @IsNotEmpty()
    stratDate: string;

    @IsString()
    @IsNotEmpty()
    endDate: string;
}