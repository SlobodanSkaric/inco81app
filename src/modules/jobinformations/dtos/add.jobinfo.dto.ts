import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AddJobinfoDto {
    /** Employee user id the job information belongs to. */
    @IsNotEmpty()
    @IsNumber()
    userId: number;

    @IsNotEmpty()
    @IsString()
    jobTitle: string;

    @IsNotEmpty()
    @IsString()
    companyName: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    jobDescription?: string;
}
