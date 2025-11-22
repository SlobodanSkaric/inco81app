import { IsNotEmpty, IsString } from "class-validator";

export class LoginSuperadministratorsDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}