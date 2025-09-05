import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'entitets/entities/Users';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/user.info.dto';
import { UserAddDto } from './dto/user.add.dto';
import * as bcrypt from "bcrypt";
import { Administrator } from 'entitets/entities/Administrator';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(Users) private readonly userEntitets: Repository<Users>,
        @InjectRepository(Administrator) private readonly adminRepository: Repository<Administrator>
    ){}

    async getAllUsers(req): Promise<UserInfoDto[] | ApiResponse>{
        const adminId = req.user.id;
        const admin = await this.adminRepository.findOne({ 
            where: { adminId: adminId }
        });

        if(!admin){
            return new ApiResponse("error", -1002, "No admin");
        }

        const allUsers = await this.userEntitets.find({
            relations: { timeOfWorkes: true }
        });
        //console.log(allUsers);
        if(allUsers.length === 0){
            return new ApiResponse("error", -1001, "No users");
        }

        const userInfoDto: UserInfoDto[] = [];
        let sumTimeOfWork = 0;



        allUsers.forEach((data) => {
            const timeOfWorkSet = data.timeOfWorkes;
            timeOfWorkSet.forEach((dataSet) =>{
                if(data.userId == dataSet.userId){
                    sumTimeOfWork += dataSet.checked_out.getTime() - dataSet.checked_in.getTime();
                }
            
           });
            
            let sumTimeOfWorkset = Number((sumTimeOfWork / (1000 * 60 * 60)).toFixed(2)); 
            let sufix = "H";

            if(sumTimeOfWorkset < 1){
                sufix = "min";
                sumTimeOfWorkset = Number(sumTimeOfWorkset.toString().split(".")[1])
            }
            userInfoDto.push(new UserInfoDto(data.userId, data.name, data.lastname, data.email, data.phonenumber,data.timeOfWorkes,sumTimeOfWorkset.toString() + sufix));
            sumTimeOfWork = 0;
        });

        return userInfoDto;
    }

    async getUserById(req): Promise<UserInfoDto | ApiResponse>{
        const getId = req.user.id;
        
        const user = await this.userEntitets.findOne({ where: { userId: getId } });

        if(!user){
            return new ApiResponse("error", -1001, "No user");
        }

        return new UserInfoDto(user.userId, user.name, user.lastname, user.email, user.phonenumber);
    }

    async getByEmail(email: string): Promise<Users | null>{
            const user = await this.userEntitets.findOne({ where : { email: email } });
    
            if(!user){
                return null;
            }
    
            return user;
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
            return await this.getUserByIdLocal(saveUser.userId);
        }catch(error){
            if(error.errno === 1062 || error.code === "ER_DUP_ENTRY" || error.errno === 23505){
                throw new ConflictException("User that this email or phone number alredy existe");
            }
            throw error;
        }
    }


    async getUserByIdLocal(id: number): Promise<UserInfoDto | ApiResponse>{
        const user = await this.userEntitets.findOne({ where: { userId: id } });

        if(!user){
            return new ApiResponse("error", -1003, "No user");
        }

        const userIfno = new UserInfoDto(user.userId, user.name, user.lastname, user.email, user.phonenumber);
        return userIfno;

    }

    async updateUser(){}//TODO
        
}
