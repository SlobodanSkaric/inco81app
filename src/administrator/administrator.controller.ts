import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdministratorInfoDto } from './dto/administrator.info.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AdministratorAddDto } from './dto/administrator.add.dto';

@Controller('administrator')
export class AdministratorController {
    constructor(private readonly admiServices: AdministratorService){}

    @Get("all")
    async getAllAdministrator(): Promise<AdministratorInfoDto[] | ApiResponse>{
        return await this.admiServices.getAllAdmin();
    }

    @Get(":id")
    async getAdminstratorById(@Param("id") id: number): Promise<AdministratorInfoDto | ApiResponse>{
        return await this.admiServices.getById(id);
    }

    @Post("add")
    async addAdministrator(@Body() data: AdministratorAddDto): Promise<AdministratorInfoDto | ApiResponse>{
        return await this.admiServices.addAdministratorServices(data);
    }
}
