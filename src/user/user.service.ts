import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'entitets/entities/Users';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/user.info.dto';
import { UserAddDto } from './dto/user.add.dto';
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
    constructor(@InjectRepository(Users) private readonly userEntitets: Repository<Users>){}

    async getAllUsers(): Promise<UserInfoDto[] | ApiResponse>{
        const allUsers = await this.userEntitets.find();
        
        if(allUsers.length === 0){
            return new ApiResponse("error", -1001, "No users");
        }
        const userInfoDto: UserInfoDto[] = [];

        allUsers.forEach((data) => {
            userInfoDto.push(new UserInfoDto(data.userId, data.name, data.lastname, data.email, data.phonenumber));
        });

        return userInfoDto;
    }

    async getUserById(id: number): Promise<UserInfoDto | ApiResponse>{
        const user = await this.userEntitets.findOne({ where: { userId: id } });

        if(!user){
            return new ApiResponse("error", -1001, "No user");
        }

        return new UserInfoDto(user.userId, user.name, user.lastname, user.email, user.phonenumber);
    }

    async addUser(data: UserAddDto): Promise<UserInfoDto | ApiResponse>{
        const user = new Users();

        const saltRound = 10;

        user.name = data.name;
        user.lastname = data.lastname;
        user.email = data.email;
        user.phonenumber = data.phonenumber;

        const passwordHash = await bcrypt.hash(data.password, saltRound);

        user.password = passwordHash;

        try{
            const saveUser = await this.userEntitets.save(user);
            return await this.getUserById(saveUser.userId);
        }catch(error){
            if(error.code === 1062 || error.code === 23505){
                throw new ConflictException("User that this email or phone number alredy existe");
            }
            throw error;
        }
    }



    async updateUser(){}//TODO
        
}
