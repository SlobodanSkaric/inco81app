import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class AddCustomersDto {
    @IsString()
    @IsNotEmpty()
    customerName: string;

    @IsString()
    @IsNotEmpty()
    contactEmail: string;
    
    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    address: string;
}