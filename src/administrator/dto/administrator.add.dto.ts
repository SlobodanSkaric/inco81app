import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

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
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    @Matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]+$/, { message: "Password must have alpha, numberic and specials characeters" })
    @IsNotEmpty()    
    password: string;
}