import { Body, Controller, Post, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Orders } from 'src/entitets/entities/Orders';
import { Request } from 'express';

class MarkOrderPaidDto {
    @IsInt()
    @IsPositive()
    orderId: number;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    note?: string;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @ApiOperation({ summary: 'Mark order payment as paid (admin)' })
    @ApiAuth('administrator', 'superadministrator')
    @ApiResult(Orders, { status: 201 })
    @Post('mark-paid')
    @Roles('administrator', 'superadministrator')
    async markPaid(
        @Body() body: MarkOrderPaidDto,
        @Req() req: Request,
    ): Promise<Orders | ApiResponse> {
        return this.paymentsService.markOrderAsPaid(body.orderId, {
            userId: req.user.id,
            note: body.note,
        });
    }
}
