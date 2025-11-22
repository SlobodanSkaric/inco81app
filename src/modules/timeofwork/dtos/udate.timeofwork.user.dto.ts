import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UdateTimeOfWorkUserDto{
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    dateStartTime: string;

    @IsOptional()
    @IsString()
    dateEndTime: string;
}