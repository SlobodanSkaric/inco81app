import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdministratorInfoDto } from './dto/administrator.info.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AdministratorAddDto } from './dto/administrator.add.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { Request } from 'express';
import { EditUserTimeOfWorkDto } from './dto/edit.user.timeofwork.dto';
import { JwtAuthGuards } from 'src/auth/jwtAuthGuards';
import { DeleteUserTimeOfWorkDto } from './dto/delete.user.timeofwork';

@Controller('administrator')
export class AdministratorController {
    constructor(private readonly admiServices: AdministratorService){}

    @Get("all")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getAllAdministrator(): Promise<AdministratorInfoDto[] | ApiResponse>{
        return await this.admiServices.getAllAdmin();
    }

    @Get("")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getAdminstratorById(@Req() req: Request): Promise<AdministratorInfoDto | ApiResponse>{
        return await this.admiServices.getById(req);
    }

    @Post("add")//add role and gurds of superadmin
    async addAdministrator(@Body() data: AdministratorAddDto): Promise<AdministratorInfoDto | ApiResponse>{
        return await this.admiServices.addAdministratorServices(data);
    }

    @Post("edit/timeofwork/")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async editUserTimeOfWork(@Body() data: EditUserTimeOfWorkDto, @Param("optional") optional: string){
        return await this.admiServices.editUserTimeOfWork(data);
    }

    @Post("delete/timeofwork")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async deleteUserTimeOfWork(@Body() data: DeleteUserTimeOfWorkDto){
        return await this.admiServices.deleteUserTimeOfWork(data);
    }


    @Post("edit/adminstator")//This is methods to move superadministrator
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async editAdministrator(@Body() data: AdministratorAddDto, @Req() req: Request): Promise<AdministratorInfoDto | ApiResponse | void>{
        /* return await this.admiServices.editAdministrator(data, req); */
    }

    @Post("delete/administrator/{:id}")//This is methods to move superadministrator
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async deleteAdministrator(@Param("id") id: number, @Req() req: Request): Promise<AdministratorInfoDto | ApiResponse | void>{
        /* return await this.admiServices.deleteAdministrator(id, req); */
    }
}
