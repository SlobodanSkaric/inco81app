import { IsNotEmpty, IsString } from "class-validator";

export class AddSuperadministratorsDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString() 
    @IsNotEmpty()
    phoneNumber?: string;
}