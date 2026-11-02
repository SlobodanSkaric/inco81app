import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { JwtAuthGuards } from 'src/modules/auth/jwtAuthGuards';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth } from 'src/common/decorators/swagger.decorator';
import { ReportDto } from './dto/report.dto';

@ApiTags('report')
@Controller('report')
export class ReportController {
    constructor(private readonly reportServices: ReportService){}

    @ApiOperation({ summary: 'Generate PDF work time report for a user' })
    @ApiAuth("administrator")
    @ApiBody({ type: ReportDto })
    @ApiCreatedResponse({ schema: { type: 'object', properties: { message: { type: 'string' } } } })
    @Post("/generate")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async genrateReportes(@Body() report):Promise<string | {message: string}>{
        return this.reportServices.createPdfReport(report);
    }

}
