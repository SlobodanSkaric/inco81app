import { Transform } from "class-transformer";
import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UserEditDto{

    @IsString()
    @IsOptional()
    name:string;

    @IsString()
    @IsOptional()
    lastname:string;


    @Transform(({ value }) => (value === "" ? undefined : value))
    @IsOptional()
    @IsEmail()
    email:string;

    @Transform(({ value }) => (value === "" ? undefined : value))
    @IsString() 
    @IsOptional()
    phonenumber:string;

    @IsString() 
    @IsOptional()
    @MinLength(8, {message: "Password is too short, minimum length is 8 characters"})
    @Matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]+$/)
    password?:string;
}