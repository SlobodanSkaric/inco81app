import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddVacationsDto {
    @IsString()
    @IsNotEmpty()    
    vacation_start: string;

    @IsString()
    @IsNotEmpty()
    vacation_end: string;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsString()
    @IsOptional()
    user_comment?: string;
}