import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class AuthDto{
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}