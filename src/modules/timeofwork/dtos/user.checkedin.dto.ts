import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class UserCheckedInDto{

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    adminId: number;
}