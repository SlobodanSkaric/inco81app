import { Body, Controller, Get, Param, ParseIntPipe, Post,  Req } from '@nestjs/common';
import { JobinformationsService } from './jobinformations.service';
import { JobInformations } from 'src/entitets/entities/JobInformations';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { AddJobinfoDto } from './dtos/add.jobinfo.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';
import { Request } from 'express';

@ApiTags('jobinformations')
@Controller('jobinformations')
export class JobinformationsController {
    constructor(private readonly jobinfo: JobinformationsService){}

    @ApiOperation({ summary: 'Get all job informations for the current user / managed employees' })
    @ApiAuth("administrator","user","superadministrator")
    @ApiResult(JobInformations, { isArray: true })
    @Get("all")
    @Roles("administrator","user","superadministrator")
    async getAllJobInformations(@Req() req: Request): Promise<JobInformations[] | ApiResponse>{
        return await this.jobinfo.findAllJob(req.user.id, req.user.role);
    }

    @ApiOperation({ summary: 'Get job information by id' })
    @ApiAuth("administrator","user","superadministrator")
    @ApiResult(JobInformations)
    @Get("job/:id")
    @Roles("administrator","user","superadministrator")
    async getJobById(@Param("id", ParseIntPipe) id: number, @Req() req: Request): Promise<JobInformations | ApiResponse>{
        return await this.jobinfo.getJobById(id, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: 'Create job information for a managed employee' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(JobInformations, { status: 201 })
    @Post("add")
    @Roles("administrator", "superadministrator")
    async saveJobInformations(@Body() data: AddJobinfoDto, @Req() req: Request): Promise<JobInformations | ApiResponse>{
        return await this.jobinfo.addJobs(data, req.user.id, req.user.role);
    }
}
