import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class GetHorseDto{
    @IsString()
    @IsNotEmpty()
    startDate: string;

    @IsString()
    @IsNotEmpty()
    endDate: string;
}