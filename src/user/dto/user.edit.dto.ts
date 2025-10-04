import { Transform } from "class-transformer";
import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

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

    @IsString() 
    @IsOptional()
    phonenumber:string;

    @IsString() 
    @IsOptional()
    password?:string;
}