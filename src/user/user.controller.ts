import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Users } from 'entitets/entities/Users';
import { UserInfoDto } from './dto/user.info.dto';
import { UserAddDto } from './dto/user.add.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { RoleGuards } from 'src/common/guards/roles.guards';


@Controller('user')
export class UserController {
    constructor(private readonly userServices: UserService){}

    @Get("/all")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async getAll(): Promise<UserInfoDto[] | ApiResponse>{
        return this.userServices.getAllUsers();
    }

    @Get(":id")
    @Roles("user","administrator")
    @UseGuards(RoleGuards)
    async agById(@Param("id") id: number): Promise<UserInfoDto | ApiResponse>{
        return this.userServices.getUserById(id);
    }


    @Post("/add")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async addUser(@Body() data: UserAddDto): Promise<UserInfoDto | ApiResponse>{
        return this.userServices.addUser(data);
    }
}
