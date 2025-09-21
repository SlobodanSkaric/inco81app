import { IsIn, IsNotEmpty, IsNumber } from "class-validator";
import { Not } from "typeorm";

export class UserVisibilityDto{
    @IsNumber()
    @IsNotEmpty()    
    user_id: number;

    @IsNumber()
    @IsNotEmpty()
    @IsIn([0,1], {message: "visible must be 0 or 1"})
    visible: number;
}