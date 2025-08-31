import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class UserCheckedOutDto{

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    adminId: number;
}