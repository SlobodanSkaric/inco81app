import { Body, Controller, Post, Req } from '@nestjs/common';
import { ReportService } from './report.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth } from 'src/common/decorators/swagger.decorator';
import { ReportDto } from './dto/report.dto';
import { Request } from 'express';

@ApiTags('report')
@Controller('report')
export class ReportController {
    constructor(private readonly reportServices: ReportService){}

    @ApiOperation({ summary: 'Generate PDF work time report for a user' })
    @ApiAuth("administrator", "superadministrator")
    @ApiBody({ type: ReportDto })
    @ApiCreatedResponse({ schema: { type: 'object', properties: { message: { type: 'string' } } } })
    @Post("/generate")
    @Roles("administrator", "superadministrator")
    async genrateReportes(@Body() report: ReportDto, @Req() req: Request){
        return this.reportServices.createPdfReport(report, req.user.id, req.user.role);
    }

}
