import { Body, Controller, Get, Param, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdministratorInfoDto } from './dto/administrator.info.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AdministratorAddDto } from './dto/administrator.add.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { Request } from 'express';
import { EditUserTimeOfWorkDto } from './dto/edit.user.timeofwork.dto';
import { JwtAuthGuards } from 'src/modules/auth/jwtAuthGuards';
import { DeleteUserTimeOfWorkDto } from './dto/delete.user.timeofwork';
import { OrdersService } from '../orders/orders.service';
import { DecideVacationDto } from '../vacation/dto/decide.vactions.dto';
import { Vacations } from 'src/entitets/entities/Vacations';
import { RedisService } from '../redis/redis.service';
import { CacheRedisIntrceptor } from 'src/common/interceptors/cache.redis.interceptors';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { RequestVacationDto } from '../vacation/dto/rewquest.vactions.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';
import { OrderGetAllDto } from '../orders/dtos/order.get.all.dto';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';

@ApiTags('administrator')
@Controller('administrator')
export class AdministratorController {
    constructor(
        private readonly admiServices: AdministratorService,
        private readonly OrdersServices: OrdersService,
        private readonly RedisService: RedisService
    ){}

    @ApiOperation({ summary: 'Get all administrators' })
    @ApiAuth("administrator")
    @ApiResult(AdministratorInfoDto, { isArray: true })
    @UseInterceptors(CacheRedisIntrceptor)
    @Get("all")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)    
    async getAllAdministrator(): Promise<AdministratorInfoDto[] | ApiResponse>{   
        const adminstratorsData =  await this.admiServices.getAllAdmin();
        return adminstratorsData;
    }

    @ApiOperation({ summary: 'Get logged-in administrator profile' })
    @ApiAuth("administrator")
    @ApiResult(AdministratorInfoDto)
    @UseInterceptors(CacheRedisIntrceptor)
    @Get("")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getAdminstratorById(@Req() req: Request): Promise<AdministratorInfoDto | ApiResponse>{
        const administratorId = req.user.id;

        const adminData = await this.admiServices.getById(administratorId);
        return adminData;
   
    }

    @ApiOperation({ summary: 'Create administrator' })
    @ApiAuth("superadministrator")
    @ApiResult(AdministratorInfoDto, { status: 201 })
    @Post("add")//add role and guards of superadmin
    @Roles("superadministrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async addAdministrator(@Body() data: AdministratorAddDto): Promise<AdministratorInfoDto | ApiResponse>{
        return await this.admiServices.addAdministratorServices(data);
    }

    @ApiOperation({ summary: "Edit user's time of work end date" })
    @ApiAuth("administrator")
    @ApiResult(TimeOfWorke, { status: 201, isArray: true })
    @Post("edit/timeofwork/")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async editUserTimeOfWork(@Body() data: EditUserTimeOfWorkDto){
        return await this.admiServices.editUserTimeOfWork(data);
    }

    @ApiOperation({ summary: "Delete user's time of work entry" })
    @ApiAuth("administrator")
    @ApiResult(TimeOfWorke, { status: 201 })
    @Post("delete/timeofwork")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async deleteUserTimeOfWork(@Body() data: DeleteUserTimeOfWorkDto){
        return await this.admiServices.deleteUserTimeOfWork(data);
    }

    @ApiOperation({ summary: 'Get all orders' })
    @ApiAuth("administrator")
    @ApiResult(OrderGetAllDto, { isArray: true })
    @Get("get/allorders")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getAllOrders(@Req() req: Request){
        return await this.OrdersServices.getAllOrders();
    }


    @ApiOperation({ summary: 'Edit administrator (not implemented yet)', deprecated: true })
    @ApiAuth("administrator")
    @Post("edit/adminstator")//This is methods to move superadministrator
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async editAdministrator(@Body() data: AdministratorAddDto, @Req() req: Request): Promise<AdministratorInfoDto | ApiResponse | void>{
        /* return await this.admiServices.editAdministrator(data, req); */
    }

    @ApiOperation({ summary: 'Get vacation requests assigned to logged-in administrator' })
    @ApiAuth("administrator")
    @ApiResult(RequestVacationDto, { isArray: true })
    @Get("getallvactions")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getAllVactionsByAdministrators(@Req() req: Request):Promise<RequestVacationDto[] | ApiResponse>{
        const getAllVactions: RequestVacationDto[] | ApiResponse = await this.admiServices.administratrosDecideUserVaction(req.user.id);
        return getAllVactions;
    }


    @ApiOperation({ summary: 'Approve or reject a vacation request' })
    @ApiAuth("administrator")
    @ApiResult(Vacations, { status: 201 })
    @Post("vactions/decides")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async administratrosDecideUserVaction2(@Body() data: DecideVacationDto, @Req() req: Request): Promise<Vacations | ApiResponse>{
        const adminId = req.user.id;
        return await this.admiServices.editUserVactionbyAdmin(data, adminId);
    }
}
