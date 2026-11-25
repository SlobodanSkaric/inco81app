import { IsInt, IsPositive } from "class-validator";

export class DeleteAdministratorDto {
    @IsInt()
    @IsPositive()
    id: number;
}
