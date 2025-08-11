import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Users } from 'entitets/entities/Users';

@Controller('user')
export class UserController {
    constructor(private readonly userServices: UserService){}

    @Get("/all")
    async getAll(): Promise<Users[] | ApiResponse>{
        return this.userServices.getAllUsers();
    }
}
