import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UdateTimeOfWorkUserDto{
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsNotEmpty()
    @IsString()
    dateStartTime: string;

    @IsNotEmpty()
    @IsString()
    dateEndTime: string;
}