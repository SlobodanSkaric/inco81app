import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdministratorInfoDto } from './dto/administrator.info.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AdministratorAddDto } from './dto/administrator.add.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { Request } from 'express';
import { EditUserTimeOfWorkDto } from './dto/edit.user.timeofwork.dto';

@Controller('administrator')
export class AdministratorController {
    constructor(private readonly admiServices: AdministratorService){}

    @Get("all")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async getAllAdministrator(): Promise<AdministratorInfoDto[] | ApiResponse>{
        return await this.admiServices.getAllAdmin();
    }

    @Get("")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async getAdminstratorById(@Req() req: Request): Promise<AdministratorInfoDto | ApiResponse>{
        return await this.admiServices.getById(req);
    }

    @Post("add")//add role and gurds of superadmin
    async addAdministrator(@Body() data: AdministratorAddDto): Promise<AdministratorInfoDto | ApiResponse>{
        return await this.admiServices.addAdministratorServices(data);
    }

    @Post("edit/timeofwork/{:optional}")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async editUserTimeOfWork(@Body() data, @Param("optional") optional: string){
        return await this.admiServices.edutUserTimeOfWork(data, optional);
    }
}
