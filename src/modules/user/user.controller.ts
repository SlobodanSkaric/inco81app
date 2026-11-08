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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';


@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(
        private readonly userServices: UserService, 
        private readonly RedisService: RedisService,
    ){}

    @ApiOperation({ summary: 'Get all users of logged-in administrator' })
    @ApiAuth("administrator")
    @ApiResult(UserInfoDto, { isArray: true })
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

    @ApiOperation({ summary: 'Get logged-in user profile' })
    @ApiAuth()
    @ApiResult(UserInfoDto)
    @UseInterceptors(CacheRedisIntrceptor)
    @Get("")
    @Roles("user")
    @UseGuards(JwtAuthGuards)
    async getById(@Req() req: Request): Promise<UserInfoDto | ApiResponse>{     
        const userData = await this.userServices.getUserById(req.user.id);
        return userData;
    }


    @ApiOperation({ summary: 'Create user' })
    @ApiAuth("administrator")
    @ApiResult(UserInfoDto, { status: 201 })
    @Post("/add")
    @Roles("administrator")
    @Permissions("create")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async addUser(@Body() data: UserAddDto): Promise<UserInfoDto | ApiResponse>{
        return this.userServices.addUser(data);
    }

    @ApiOperation({ summary: 'Change user visibility (soft delete / restore)' })
    @ApiAuth("administrator")
    @ApiResult(undefined, { status: 201 })
    @Post("/delete")
    @Roles("administrator")
    @Permissions("delete")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async deleteUser(@Body() user_data: UserVisibilityDto): Promise<ApiResponse>{
        return this.userServices.deleteUser(user_data);
    }

    @ApiOperation({ summary: 'Edit logged-in user profile' })
    @ApiAuth("user")
    @ApiResult(UserInfoDto, { status: 201 })
    @Post("/edit")
    @Roles("user")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async editUser(@Body() userData: UserEditDto, @Req() req: Request): Promise<UserInfoDto | ApiResponse>{
        return this.userServices.editUser(userData, req.user.id);
    }
}
