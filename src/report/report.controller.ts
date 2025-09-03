import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { Roles } from 'src/common/decorators/role.decorators';
import { RoleGuards } from 'src/common/guards/roles.guards';

@Controller('report')
export class ReportController {
    constructor(private readonly reportServices: ReportService){}

    @Post("/generate")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async genrateReportes(@Body() report):Promise<string | {message: string}>{
        return this.reportServices.createPdfReport(report);
    }

}
