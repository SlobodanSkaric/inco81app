import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class GetHorseDto{
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    stratDate: string;

    @IsString()
    @IsNotEmpty()
    endDate: string;
}