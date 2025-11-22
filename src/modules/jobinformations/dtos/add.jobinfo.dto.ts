import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddJobinfoDto {
    @IsNotEmpty()
    @IsNumber()
    administratorId?: number;

    @IsNotEmpty()
    @IsString()
    jobTitle: string;

    @IsNotEmpty()
    @IsString()
    companyName: string;

    @IsNotEmpty()
    @IsString()
    location?: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @IsNotEmpty()
    @IsDateString()
    endDate: string;

    @IsNotEmpty()
    @IsString()
    jobDescription?: string;
}