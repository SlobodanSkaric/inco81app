import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { SuperadministratorService } from './superadministrator.service';
import { AddSuperadministratorsDto } from './dtos/add.superadministrators.dto';
import { Request } from 'express';
import { LoginSuperadministratorsDto } from './dtos/login.superadministrators.dto';

@Controller('superadministrator')
export class SuperadministratorController {
    constructor(private readonly superadmins: SuperadministratorService) {}


    @Get("/{:id}")
    async getSuperAdministrators(@Param("id") id: Number): Promise<any> {//implement cookie or token based auth
        const superadministratorGetById = await this.superadmins.getUserById(id);

    
        return superadministratorGetById;
    }

    @Post("add")
    async addSuperAdministrators(@Body() superadminsData: AddSuperadministratorsDto): Promise<any> {
        const addSuperadministrator = await this.superadmins.addSuperAdministrators(superadminsData);

        return addSuperadministrator;
    }



}
