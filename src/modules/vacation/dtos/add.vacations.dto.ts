import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AddVacationsDto {
    @IsString()
    @IsNotEmpty()    
    vacation_start: string;

    @IsString()
    @IsNotEmpty()
    vacation_end: string;

    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    adminId: number;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsNumber()
    @IsNotEmpty()
    status: number;

    @IsString()
    @IsOptional()
    admin_comment?: string;

    @IsString()
    @IsOptional()
    user_comment?: string;
}