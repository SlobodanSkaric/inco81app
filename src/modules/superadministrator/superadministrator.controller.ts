import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SuperadministratorService } from './superadministrator.service';
import { AddSuperadministratorsDto } from './dtos/add.superadministrators.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { JwtRefreshGuards } from '../auth/jwtRefreshGuards';
import { JwtAuthGuards } from '../auth/jwtAuthGuards';
import { Request } from 'express';
import { SuperadministratorInfoDto } from './dtos/superadministrator.info.dto';
import { ApiResponse } from 'src/misc/api.response.dto';

@Controller('superadministrator')
export class SuperadministratorController {
    constructor(private readonly superadmins: SuperadministratorService) {}


    @Get("")
    @Roles("superadministrator")
    @UseGuards(JwtAuthGuards,JwtRefreshGuards,RoleGuards)
    async getSuperAdministrators( @Req() req: Request): Promise<SuperadministratorInfoDto | ApiResponse> {
        const superadministratorGetById = await this.superadmins.getUserById(req.user.id);

        if(superadministratorGetById instanceof ApiResponse){
            return superadministratorGetById;
        }

        const superadministratorInfo = new SuperadministratorInfoDto(
            superadministratorGetById.superAdmistratorId,
            superadministratorGetById.username,
            superadministratorGetById.email,
            superadministratorGetById.phoneNumber? superadministratorGetById.phoneNumber : ''
        );

        return superadministratorInfo;
    }

    @Post("add")
    async addSuperAdministrators(@Body() superadminsData: AddSuperadministratorsDto): Promise<SuperadministratorInfoDto | ApiResponse> {
        const addSuperadministrator = await this.superadmins.addSuperAdministrators(superadminsData);

        if(addSuperadministrator instanceof ApiResponse){
            return addSuperadministrator;
        }

        const superadmistratorInfo = new SuperadministratorInfoDto(
            addSuperadministrator.superAdmistratorId,
            addSuperadministrator.username,
            addSuperadministrator.email,
            addSuperadministrator.phoneNumber? addSuperadministrator.phoneNumber : ''
        );

        return superadmistratorInfo;

    }




}
