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
import { Users } from 'entitets/entities/Users';
import { Vacations } from 'entitets/entities/Vacations';
import { RequestVacationDto } from '../vacation/dto/rewquest.vactions.dto';
import { DecideVacationDto } from '../vacation/dto/decide.vactions.dto';

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator) private readonly administratorEntitets: Repository<Administrator>,
        @InjectRepository(TimeOfWorke) private readonly timeOfWorkeEntitets: Repository<TimeOfWorke>,
        @InjectRepository(Vacations) private readonly vacationsEntitets: Repository<Vacations>
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
        }catch(error: unknown){
            if(error instanceof Object && 'errno' in error && (error.errno === 1062 || error.errno === 23505)){
                throw new ConflictException("Administrator for this email or phonenumber is  existes");
            }
            return new ApiResponse("error", -1008, "Failed to add administrator");
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
        //console.log( userId, result, udateDataAndTime);
    }

    async deleteUserTimeOfWork(data: DeleteUserTimeOfWorkDto): Promise<TimeOfWorke | ApiResponse | any>{
        const getTimeOfWorForUser = await this.timeOfWorkeEntitets.findOne({ where: { timeOfWorkeId: data.timeOfWorkeId, user: { userId: data.userId } as Users } });

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

    async administratrosDecideUserVaction(adminId: number): Promise<RequestVacationDto[] | ApiResponse>{
        const getAllserVactionRequests = await this.vacationsEntitets.find({
            where: { status: 1, admin: { adminId } },
            relations: { user: true, admin: true }
        });
        
        const curentRquestsUserVactions: RequestVacationDto[] = [];

        for(const requests of getAllserVactionRequests){
            curentRquestsUserVactions.push({
                vacationId: requests.vacationId,
                vacation_start: requests.vacation_start.toISOString(),
                vacation_end: requests.vacation_end.toISOString(),
                userId: requests.user.userId,
                admin: requests.admin.adminId,
                reason: requests.reason,
                status: requests.status,
                admin_comment: requests.admin_comment ?? undefined,
                user_comment: requests.user_comment ?? undefined
            });
        }

        if(curentRquestsUserVactions.length === 0){
            return new ApiResponse("error", -1012, "No vacation requests found!");
        }

        return curentRquestsUserVactions;
    }

    async editUserVactionbyAdmin(data:DecideVacationDto): Promise<Vacations | ApiResponse>{
        const getVacationRequest = await this.vacationsEntitets.findOne({ where: { vacationId: data.vacationId } });

        if(!getVacationRequest){
            return new ApiResponse("error", -1013, "Vacation request not found!");
        }

        if(getVacationRequest.status === data.status){
            return new ApiResponse("error", -1014, "Vacation request is already in this status!");
        }

        getVacationRequest.status = data.status;
        getVacationRequest.admin_comment = data.admin_comment ?? null;

        const updateVacationRequest = await this.vacationsEntitets.save(getVacationRequest);

        if(!updateVacationRequest){
            return new ApiResponse("error", -1015, "Failed to update vacation request!");
        }

        return updateVacationRequest;
    }
}
