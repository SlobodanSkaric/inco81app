import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Users } from 'entitets/entities/Users';
import { UserInfoDto } from './dto/user.info.dto';
import { UserAddDto } from './dto/user.add.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { Request } from 'express';


@Controller('user')
export class UserController {
    constructor(private readonly userServices: UserService){}

    @Get("/all")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async getAll(@Req() req: Request): Promise<UserInfoDto[] | ApiResponse>{
        return await this.userServices.getAllUsers(req);
    }

    @Get("")
    @Roles("user")
    @UseGuards(RoleGuards)
    async agById(@Req() req: Request): Promise<UserInfoDto | ApiResponse>{
        return this.userServices.getUserById(req);
    }


    @Post("/add")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async addUser(@Body() data: UserAddDto): Promise<UserInfoDto | ApiResponse>{
        return this.userServices.addUser(data);
    }
}
