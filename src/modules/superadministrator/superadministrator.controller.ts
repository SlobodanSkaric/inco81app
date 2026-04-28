import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SuperadministratorService } from './superadministrator.service';
import { AddSuperadministratorsDto } from './dtos/add.superadministrators.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { JwtRefreshGuards } from '../auth/jwtRefreshGuards';
import { JwtAuthGuards } from '../auth/jwtAuthGuards';

@Controller('superadministrator')
export class SuperadministratorController {
    constructor(private readonly superadmins: SuperadministratorService) {}


    @Get("/:id")
    @Roles("superadministrator")
    @UseGuards(JwtAuthGuards,JwtRefreshGuards,RoleGuards)
    async getSuperAdministrators(@Param("id") id: Number): Promise<any> {
        const superadministratorGetById = await this.superadmins.getUserById(id);

    
        return superadministratorGetById;
    }

    @Post("add")
    async addSuperAdministrators(@Body() superadminsData: AddSuperadministratorsDto): Promise<any> {
        const addSuperadministrator = await this.superadmins.addSuperAdministrators(superadminsData);

        return addSuperadministrator;
    }



}
