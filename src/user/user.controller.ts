import { Body, ConflictException, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Users } from 'entitets/entities/Users';
import { UserInfoDto } from './dto/user.info.dto';
import { UserAddDto } from './dto/user.add.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userServices: UserService){}

    @Get("/all")
    async getAll(): Promise<UserInfoDto[] | ApiResponse>{
        return await this.userServices.getAllUsers();
    }

    @Get(":id")
    async agById(@Param("id") id: number): Promise<UserInfoDto | ApiResponse>{
        return this.userServices.getUserById(id);
    }


    @Post("/add")
    async addUser(@Body() data: UserAddDto): Promise<UserInfoDto | ApiResponse | ConflictException>{
        return this.userServices.addUser(data);
    }
}
