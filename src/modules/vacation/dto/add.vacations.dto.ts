import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class AddVacationsDto {
    @IsString()
    @IsNotEmpty()
    vacation_start: string;

    @IsString()
    @IsNotEmpty()
    vacation_end: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(256)
    reason: string;

    @IsString()
    @IsOptional()
    @MaxLength(2000)
    user_comment?: string;
}