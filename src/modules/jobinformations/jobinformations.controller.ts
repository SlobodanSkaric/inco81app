import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JobinformationsService } from './jobinformations.service';
import { JobInformations } from 'src/entitets/entities/JobInformations';
import { ApiResponse } from 'src/misc/api.response.dto';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuards } from 'src/modules/auth/jwtAuthGuards';
import { AddJobinfoDto } from './dtos/add.jobinfo.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';

@ApiTags('jobinformations')
@Controller('jobinformations')
export class JobinformationsController {
    constructor(private readonly jobinfo: JobinformationsService){}

    @ApiOperation({ summary: 'Get all job informations' })
    @ApiAuth("administrator","user")
    @ApiResult(JobInformations, { isArray: true })
    @Get("all")
    @Roles("administrator","user")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getAllJobInformations(): Promise<JobInformations[] | ApiResponse>{
        return await this.jobinfo.findAllJob();
    }

    @ApiOperation({ summary: 'Get job information by id' })
    @ApiAuth("administrator","user")
    @ApiResult(JobInformations)
    @Get("job/:id")
    @Roles("administrator","user")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getJobById(@Param("id") id: number): Promise<JobInformations | ApiResponse>{
        return await this.jobinfo.getJobById(id);
    }

    @ApiOperation({ summary: 'Create job information' })
    @ApiAuth("administrator")
    @ApiResult(JobInformations, { status: 201 })
    @Post("add")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async saveJobInformations(@Body() data: AddJobinfoDto): Promise<JobInformations | ApiResponse>{
        
        return await this.jobinfo.addJobs(data);
    }
}
