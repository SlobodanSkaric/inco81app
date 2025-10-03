import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from 'src/misc/api.response.dto';
import { UserInfoDto } from './dto/user.info.dto';
import { UserAddDto } from './dto/user.add.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { Request } from 'express';
import { Premissions } from 'src/common/decorators/premissions.decorators';
import { JwtAuthGuards } from 'src/auth/jwtAuthGuards';
import { UserVisibilityDto } from './dto/user.visibility.dto';
import { RoleGuards } from 'src/common/guards/roles.guards';


@Controller('user')
export class UserController {
    constructor(private readonly userServices: UserService){}

    @Get("/all")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getAll(@Req() req: Request): Promise<UserInfoDto[] | ApiResponse>{
        return await this.userServices.getAllUsers(req);
    }

    @Get("")
    @Roles("user")
    @UseGuards(JwtAuthGuards)
    async getById(@Req() req: Request): Promise<UserInfoDto | ApiResponse>{
        return this.userServices.getUserById(req);
    }


    @Post("/add")
    @Roles("administrator")
    @Premissions("create")
    @UseGuards(JwtAuthGuards)
    async addUser(@Body() data: UserAddDto): Promise<UserInfoDto | ApiResponse>{
        return this.userServices.addUser(data);
    }

    @Post("/delete")
    @Roles("administrator")
    @Premissions("delete")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async deleteUser(@Body() user_data: UserVisibilityDto): Promise<ApiResponse>{
        return this.userServices.deleteUser(user_data);
    }
}
