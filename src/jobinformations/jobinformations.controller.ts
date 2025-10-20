import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JobinformationsService } from './jobinformations.service';
import { JobInformations } from 'entitets/entities/JobInformations';
import { ApiResponse } from 'src/misc/api.response.dto';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/role.decorators';
import { JwtAuthGuards } from 'src/auth/jwtAuthGuards';
import { AddJobinfoDto } from './dtos/add.jobinfo.dto';

@Controller('jobinformations')
export class JobinformationsController {
    constructor(private readonly jobinfo: JobinformationsService){}

    @Get("all")
    @Roles("administrator","user")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getAllJobInformations(): Promise<JobInformations[] | ApiResponse>{
        return await this.jobinfo.findAllJob();
    }

    @Get("job/:id")
    @Roles("administrator","user")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getJobById(@Param("id") id: number): Promise<JobInformations | ApiResponse>{
        return await this.jobinfo.getJobById(id);
    }

    @Post("add")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async saveJobInformations(@Body() data: AddJobinfoDto): Promise<JobInformations | ApiResponse>{
        
        return await this.jobinfo.addJobs(data);
    }
}
