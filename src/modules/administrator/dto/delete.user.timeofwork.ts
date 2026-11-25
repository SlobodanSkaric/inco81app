import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsNumber } from "class-validator";

/** Soft-delete only: status 1 marks a shift as deleted (hidden from hour totals). */
export class DeleteUserTimeOfWorkDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    timeOfWorkeId: number;

    @ApiProperty({ example: 1, description: "Only 1 (soft-delete) is allowed" })
    @IsNumber()
    @IsIn([1], { message: "status must be 1 (soft-delete). Restoring deleted shifts is not allowed via this endpoint." })
    @IsNotEmpty()
    status: number;
}
