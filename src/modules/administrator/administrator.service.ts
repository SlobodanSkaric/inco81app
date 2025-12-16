import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'entitets/entities/Administrator';
import { Repository } from 'typeorm';
import { AdministratorInfoDto } from './dto/administrator.info.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AdministratorAddDto } from './dto/administrator.add.dto';
import * as bcrypt from "bcrypt";
import { EditUserTimeOfWorkDto } from './dto/edit.user.timeofwork.dto';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { dataUtils } from 'src/utils/data.utils';
import { DeleteUserTimeOfWorkDto } from './dto/delete.user.timeofwork';

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator) private readonly administratorEntitets: Repository<Administrator>,
        @InjectRepository(TimeOfWorke) private readonly timeOfWorkeEntitets: Repository<TimeOfWorke>,
    ){}

    async getAllAdmin(): Promise<AdministratorInfoDto[] | ApiResponse>{
        const getAdmin = await this.administratorEntitets.find();

        if(getAdmin.length === 0){
            return new ApiResponse("error", -1006, "No Administrator");
        }

        const admin: AdministratorInfoDto[] = [];

        getAdmin.forEach((data) =>{
            admin.push(new AdministratorInfoDto(data.adminId, data.name, data.lastname, data.email, data.phonenumber));
        });


        return admin;
    }

    async getByEmail(email: string): Promise<Administrator | null>{
        const admins = await this.administratorEntitets.findOne({ where : { email: email } });

        if(!admins){
            return null;
        }

        return admins;
    }


    async getById(id): Promise<AdministratorInfoDto | ApiResponse>{
        const getAdmin = await this.administratorEntitets.findOne({ where: { adminId: id } });

        if(!getAdmin){
            return new ApiResponse("error", -1007, "Adminstrator for this id is not exists");
        }

        return new AdministratorInfoDto(getAdmin.adminId, getAdmin.name, getAdmin.lastname, getAdmin.email, getAdmin.phonenumber);
    }

    

    async addAdministratorServices(data: AdministratorAddDto): Promise<AdministratorInfoDto | ApiResponse>{
        const admin = new Administrator();
        const saltRound = 10;

        admin.name = data.name;
        admin.lastname = data.lastname;
        admin.email = data.email;
        admin.phonenumber = data.phonenumber;

        const passwordHas = await bcrypt.hash(data.password, saltRound);

        admin.password = passwordHas;

        try{
            const saveAdministrator = await this.administratorEntitets.save(admin);
            return await this.getById(saveAdministrator.adminId);
        }catch(error){
            if(error.errno === 1062 || error.errno === 23505){
                throw new ConflictException("Administrator for this email or phonenumber is  existes");
            }
            return error;
        }
    }

    async editUserTimeOfWork(data: EditUserTimeOfWorkDto):Promise<TimeOfWorke[] | ApiResponse>{
        const getDate = data.dateEndTime.split(" ")[0];
        const excangeDate = dataUtils(data.dateEndTime);
        const checkedInDate = new Date(getDate);
        
       const result = await this.timeOfWorkeEntitets.createQueryBuilder("time_of_works")
                        .where("DATE(time_of_works.checked_in) = :checked_in", { checked_in: checkedInDate.toISOString().split('T')[0] })
                        .andWhere("time_of_works.userId = :userId", { userId: data.userId })
                        .andWhere("time_of_works.status = :status", { status: 0 })
                        .getMany();

        if(!result){
            return new ApiResponse("error", -1009, "Time of work for this user is not exists");
        }

        return result;
    }

    async updateUserTimeOfWork(userId:number, result: any, udateDataAndTime: any){
        console.log( userId, result, udateDataAndTime);
    }

    async deleteUserTimeOfWork(data: DeleteUserTimeOfWorkDto): Promise<TimeOfWorke | ApiResponse | any>{
        const getTimeOfWorForUser = await this.timeOfWorkeEntitets.findOne({ where: { timeOfWorkeId: data.timeOfWorkeId, userId: data.userId } });

        if(!getTimeOfWorForUser){
            return new ApiResponse("error", -1009, "Time of work for this user is not exists");
        }

        if(getTimeOfWorForUser.status === data.status){
            return new ApiResponse("error", -1011, "Time of work for this user is already in this status");
        }

        const deleteTimeOfWorkUser = await  this.timeOfWorkeEntitets.update({ timeOfWorkeId: data.timeOfWorkeId }, { status: data.status });

        if(deleteTimeOfWorkUser.affected === 0){
            return new ApiResponse("error", -1010, "Can not delete time of work for this user");
        }

        const getUpdateTimeOfWork = await this.timeOfWorkeEntitets.findOne({ where: { timeOfWorkeId: data.timeOfWorkeId } });

        return getUpdateTimeOfWork;
    }
}
