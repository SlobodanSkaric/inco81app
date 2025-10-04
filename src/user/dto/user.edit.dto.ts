import { IsEmail, IsNumber, IsString } from "class-validator";

export class UserEditDto{
    @IsNumber()
    userId:number;
    
    @IsString()
    name:string;

    @IsString()
    lastname:string;

    @IsEmail()
    email:string;

    @IsString() 
    phonenumber:string;

    @IsString() 
    password?:string;
}