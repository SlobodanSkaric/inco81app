import { Body, Controller, Get, Param, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { SuperadministratorService } from './superadministrator.service';
import { AddSuperadministratorsDto } from './dtos/add.superadministrators.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { JwtAuthGuards } from '../auth/jwtAuthGuards';
import { Request } from 'express';
import { SuperadministratorInfoDto } from './dtos/superadministrator.info.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { RedisService } from '../redis/redis.service';
import { CacheRedisIntrceptor } from 'src/common/interceptors/cache.redis.interceptors';
import { AdministratorService } from '../administrator/administrator.service';

@Controller('superadministrator')
export class SuperadministratorController {
    constructor(
        private readonly superadmins: SuperadministratorService,
        private readonly administrator: AdministratorService,
    ) {}


    @UseInterceptors(CacheRedisIntrceptor)
    @Get("")
    @Roles("superadministrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
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

   
    @Get("delete/administrator/:id")
    @Roles("superadministrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async deleteAdministrator(@Param("id") id: number){
        const deleteResult = await this.administrator.editAministators(id);

        return deleteResult;
    }



}
