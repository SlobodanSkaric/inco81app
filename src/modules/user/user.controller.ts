import { Body, Controller, Get, Inject, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from 'src/misc/api.response.dto';
import { UserInfoDto } from './dto/user.info.dto';
import { UserAddDto } from './dto/user.add.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Request } from 'express';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { JwtAuthGuards } from 'src/modules/auth/jwtAuthGuards';
import { UserVisibilityDto } from './dto/user.visibility.dto';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { UserEditDto } from './dto/user.edit.dto';
import { RedisService } from '../redis/redis.service';
import { CacheRedisIntrceptor } from 'src/common/interceptors/cache.redis.interceptors';


@Controller('user')
export class UserController {
    constructor(
        private readonly userServices: UserService, 
        private readonly RedisService: RedisService,
    ){}

    @UseInterceptors(CacheRedisIntrceptor)
    @Get("/all")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getAll(@Req() req: Request): Promise<UserInfoDto[] | ApiResponse | any >{
        const adminId = req.user.id;

      
        const usersDatas = await this.userServices.getAllUsers(adminId);

        if(usersDatas instanceof ApiResponse && usersDatas.code === -1002){
            return usersDatas;
        }

        return usersDatas;
    }

    @UseInterceptors(CacheRedisIntrceptor)
    @Get("")
    @Roles("user")
    @UseGuards(JwtAuthGuards)
    async getById(@Req() req: Request): Promise<UserInfoDto | ApiResponse>{     
        const userData = await this.userServices.getUserById(req.user.id);
        return userData;
    }


    @Post("/add")
    @Roles("administrator")
    @Permissions("create")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async addUser(@Body() data: UserAddDto): Promise<UserInfoDto | ApiResponse>{
        return this.userServices.addUser(data);
    }

    @Post("/delete")
    @Roles("administrator")
    @Permissions("delete")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async deleteUser(@Body() user_data: UserVisibilityDto): Promise<ApiResponse>{
        return this.userServices.deleteUser(user_data);
    }

    @Post("/edit")
    @Roles("user")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async editUser(@Body() userData: UserEditDto, @Req() req: Request): Promise<UserInfoDto | ApiResponse>{
        return this.userServices.editUser(userData, req.user.id);
    }
}
