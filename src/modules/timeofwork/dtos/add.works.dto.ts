import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class AddWorksDto{
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    administratorId: number;
}