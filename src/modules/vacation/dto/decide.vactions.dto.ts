import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class DecideVacationDto {
    @IsNumber()
    @IsNotEmpty()
    vacationId: number;

    @IsNumber()
    @IsNotEmpty()
    status: number;

    @IsString()
    @IsOptional()
    admin_comment?: string;
}