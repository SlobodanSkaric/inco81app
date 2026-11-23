import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { VACATION_DECISION_STATUSES, VacationStatus } from "./vacation.status.enum";

export class DecideVacationDto {
    @IsNumber()
    @IsNotEmpty()
    vacationId: number;

    @IsNumber()
    @IsNotEmpty()
    @IsIn([...VACATION_DECISION_STATUSES])
    status: VacationStatus;

    @IsString()
    @IsOptional()
    admin_comment?: string;
}
