import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'entitets/entities/Users';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(@InjectRepository(Users) private readonly userEntitets: Repository<Users>){}

    async getAllUsers(): Promise<Users[] | ApiResponse>{
        const allUsers = await this.userEntitets.find();

        if(allUsers.length === 0){
            return new ApiResponse("error", -1001, "No users");
        }

        return allUsers;
    }
}
