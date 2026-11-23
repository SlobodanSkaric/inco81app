import { Body, Controller, Get, Post, Req, UseInterceptors } from '@nestjs/common';
import { SuperadministratorService } from './superadministrator.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { Request } from 'express';
import { SuperadministratorInfoDto } from './dtos/superadministrator.info.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { CacheRedisIntrceptor } from 'src/common/interceptors/cache.redis.interceptor';
import { AdministratorService } from '../administrator/administrator.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';
import { DeleteAdministratorDto } from './dtos/delete.administrator.dto';

@ApiTags('superadministrator')
@Controller('superadministrator')
export class SuperadministratorController {
    constructor(
        private readonly superadmins: SuperadministratorService,
        private readonly administrator: AdministratorService,
    ) {}


    @ApiOperation({ summary: 'Get logged-in superadministrator profile' })
    @ApiAuth("superadministrator")
    @ApiResult(SuperadministratorInfoDto)
    @UseInterceptors(CacheRedisIntrceptor)
    @Get("")
    @Roles("superadministrator")
    async getSuperAdministrators( @Req() req: Request): Promise<SuperadministratorInfoDto | ApiResponse> {
        const superadministratorGetById = await this.superadmins.getUserById(req.user.id);
      

       if(superadministratorGetById instanceof ApiResponse){
            return superadministratorGetById;
        }

        const superadministratorInfo = new SuperadministratorInfoDto(
            superadministratorGetById.userId,
            superadministratorGetById.name,
            superadministratorGetById.email,
            superadministratorGetById.phonenumber? superadministratorGetById.phonenumber : ''
        );

        return superadministratorInfo;
    }

   
    @ApiOperation({ summary: 'Deactivate administrator by id' })
    @ApiAuth("superadministrator")
    @ApiOkResponse({ type: Boolean })
    @Post("delete/administrator")
    @Roles("superadministrator")
    async deleteAdministrator(@Body() body: DeleteAdministratorDto): Promise<boolean>{
        return await this.administrator.editAministators(body.id);
    }



}
