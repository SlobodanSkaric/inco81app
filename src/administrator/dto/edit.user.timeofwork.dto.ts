import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class EditUserTimeOfWorkDto{
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    userId: number;

    @IsString()
    @IsNotEmpty()
    dateEndTime: string;
}