import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class AddCustomersDto {
    @IsString()
    @IsNotEmpty()
    customerName: string;

    @IsEmail()
    @IsNotEmpty()
    contactEmail: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

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
