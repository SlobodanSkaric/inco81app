import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class UserAddDto{

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
    @MinLength(8, {message: "Password is too short, minimum length is 8 characters"})
    @Matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]+$/)
    password: string;
}