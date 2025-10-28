import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobInformations } from 'entitets/entities/JobInformations';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';
import { AddJobinfoDto } from './dtos/add.jobinfo.dto';

@Injectable()
export class JobinformationsService {
    constructor(@InjectRepository(JobInformations) private readonly jobinfo: Repository<JobInformations>){}

    async findAllJob(): Promise<JobInformations[] | ApiResponse> {
        const jobinfos = await this.jobinfo.find();
        
        if(jobinfos.length === 0){
            return new ApiResponse("error", -1010, "No job informations found");
        }

        return jobinfos;
    }

    async getJobById(id: number): Promise<JobInformations | ApiResponse> {
        const jobinfo = await this.jobinfo.findOne({ where: { jobInfoId: id}});

        if(!jobinfo){
            return new ApiResponse("error", -1011, "Job information not found");
        }

        return jobinfo;
    }

    async addJobs(jobinfos: AddJobinfoDto): Promise<JobInformations | ApiResponse> {
        const addJobs = new JobInformations();

        addJobs.administratorId = jobinfos.administratorId;
        addJobs.jobTitle = jobinfos.jobTitle;
        addJobs.companyName = jobinfos.companyName;
        addJobs.location = jobinfos.location;
        addJobs.startDate = new Date(jobinfos.startDate);
        addJobs.endDate = new Date(jobinfos.endDate);
        addJobs.jobDescription = jobinfos.jobDescription;

        const saveJobInfo = await this.jobinfo.save(addJobs);

        if(!saveJobInfo){
            return new ApiResponse("error", -1012, "Could not save job information");
        }

        return saveJobInfo;
    }
}
