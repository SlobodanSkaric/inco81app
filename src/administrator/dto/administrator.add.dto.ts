import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AdministratorAddDto{
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    lastname: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phonenumber:string;

    @IsString()
    @IsNotEmpty()
    password: string;
}