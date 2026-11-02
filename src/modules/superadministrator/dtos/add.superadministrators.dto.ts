import { IsEnum, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { Role } from "../../../common/enums/role.enum";

export class AddSuperadministratorsDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    lastname: string;

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;

    @IsString()
    token: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character" })
    password: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    email: string;

    @IsString() 
    @IsNotEmpty()
    @MaxLength(20, { message: "Phone number must be at most 20 characters long" })
    phoneNumber?: string;
}