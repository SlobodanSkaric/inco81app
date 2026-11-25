import { IsBoolean, IsInt, IsPositive } from "class-validator";

export class SetCustomerActiveDto {
    @IsInt()
    @IsPositive()
    customerId: number;

    @IsBoolean()
    isActive: boolean;
}
