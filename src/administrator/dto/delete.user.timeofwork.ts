import { IsNotEmpty, IsNumber } from "class-validator";

export class DeleteUserTimeOfWorkDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    timeOfWorkeId: number;

    @IsNumber()
    @IsNotEmpty()
    status: number;
}