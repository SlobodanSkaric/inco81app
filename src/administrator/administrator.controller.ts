import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdministratorInfoDto } from './dto/administrator.info.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AdministratorAddDto } from './dto/administrator.add.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { RoleGuards } from 'src/common/guards/roles.guards';

@Controller('administrator')
export class AdministratorController {
    constructor(private readonly admiServices: AdministratorService){}

    @Get("all")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async getAllAdministrator(): Promise<AdministratorInfoDto[] | ApiResponse>{
        return await this.admiServices.getAllAdmin();
    }

    @Get(":id")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async getAdminstratorById(@Param("id") id: number): Promise<AdministratorInfoDto | ApiResponse>{
        return await this.admiServices.getById(id);
    }

    @Post("add")//add role and gurds of superadmin
    async addAdministrator(@Body() data: AdministratorAddDto): Promise<AdministratorInfoDto | ApiResponse>{
        return await this.admiServices.addAdministratorServices(data);
    }
}
