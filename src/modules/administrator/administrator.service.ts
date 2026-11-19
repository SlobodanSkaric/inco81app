import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdministratorInfoDto } from './dto/administrator.info.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AdministratorAddDto } from './dto/administrator.add.dto';
import * as bcrypt from "bcrypt";
import { EditUserTimeOfWorkDto } from './dto/edit.user.timeofwork.dto';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { dataUtils } from 'src/utils/data.utils';
import { DeleteUserTimeOfWorkDto } from './dto/delete.user.timeofwork';
import { Users } from 'src/entitets/entities/Users';
import { Vacations } from 'src/entitets/entities/Vacations';
import { RequestVacationDto } from '../vacation/dto/rewquest.vactions.dto';
import { DecideVacationDto } from '../vacation/dto/decide.vactions.dto';
import { Role } from '../../common/enums/role.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SessionsRevokedEvent } from '../../common/events/auth.events';
import { CacheIvalidationEvent } from 'src/common/events/cahce.events';

@Injectable()
export class AdministratorService {
    private readonly logger = new Logger(AdministratorService.name);

    constructor(
        @InjectRepository(Users) private readonly administratorEntitets: Repository<Users>,
        @InjectRepository(TimeOfWorke) private readonly timeOfWorkeEntitets: Repository<TimeOfWorke>,
        @InjectRepository(Vacations) private readonly vacationsEntitets: Repository<Vacations>,
        private readonly eventEmmiter: EventEmitter2
    ){}

    async getAllAdmin(): Promise<AdministratorInfoDto[] | ApiResponse>{
        const getAdmin = await this.administratorEntitets.find({ where: { role: Role.ADMIN } });

        if(getAdmin.length === 0){
            return new ApiResponse("error", 404, "No Administrator");
        }

        const admin: AdministratorInfoDto[] = [];

        getAdmin.forEach((data) =>{
            admin.push(new AdministratorInfoDto(data.userId, data.name, data.lastname, data.email, data.phonenumber ?? ""));
        });


        return admin;
    }

    async getByEmail(email: string): Promise<Users | null>{
        const admins = await this.administratorEntitets.findOne({ where : { email: email, role: Role.ADMIN } });

        if(!admins){
            return null;
        }

        return admins;
    }


    async getById(id): Promise<AdministratorInfoDto | ApiResponse>{
        const getAdmin = await this.administratorEntitets.findOne({ where: { userId: id, role: Role.ADMIN } });

        if(!getAdmin){
            return new ApiResponse("error", 404, "Adminstrator for this id is not exists");
        }

        return new AdministratorInfoDto(getAdmin.userId, getAdmin.name, getAdmin.lastname, getAdmin.email, getAdmin.phonenumber ?? "");
    }

    

    async addAdministratorServices(data: AdministratorAddDto): Promise<AdministratorInfoDto | ApiResponse>{
        const admin = new Users();
        const saltRound = 10;

        admin.name = data.name;
        admin.lastname = data.lastname;
        admin.email = data.email;
        admin.phonenumber = data.phonenumber;
        admin.role = Role.ADMIN;

        const passwordHas = await bcrypt.hash(data.password, saltRound);

        admin.password = passwordHas;

        try{
            const saveAdministrator = await this.administratorEntitets.save(admin);
            this.eventEmmiter.emit("cache.invalidate",
                new CacheIvalidationEvent(
                    [],
                    [
                        "administrator:*:/administrator/all",
                        "administrator:*:/administrator",
                    ],
                    "Administrator",
                    "create",
                )
            );
            return await this.getById(saveAdministrator.userId);
        }catch(error: unknown){
            if(error instanceof Object && 'errno' in error && (error.errno === 1062 || error.errno === 23505)){
                throw new ConflictException("Administrator for this email or phonenumber is  existes");
            }
            return new ApiResponse("error", 500, "Failed to add administrator");
        }
    }

    async editAministators(id: number):Promise<boolean>{
        try{
            const result: Users | null = await this.administratorEntitets.createQueryBuilder("admiistrator_visibility")
                                 .where("admiistrator_visibility.userId = :userId", { userId: id})
                                 .andWhere("admiistrator_visibility.role = :role", { role: Role.ADMIN})
                                 .andWhere("admiistrator_visibility.visibility = :visibility", { visibility: 1})
                                 .getOne()

            if(result){
                result.visibility = 0;
                await this.administratorEntitets.save(result);
                await this.eventEmmiter.emitAsync("auth.sessions.revoked", new SessionsRevokedEvent(result.userId.toString(), Role.ADMIN));
                this.eventEmmiter.emit("cache.invalidate",
                    new CacheIvalidationEvent(
                        [
                            `administrator:${result.userId}:/administrator`,
                            `administrator:${result.userId}:/administrator/`,
                        ],
                        [
                            "administrator:*:/administrator/all",
                        ],
                        "Administrator",
                        "delete",
                    )
                );
                return true;
            }

            return false;
           
            }catch(error){
                throw new InternalServerErrorException("Database is not respone")
            }
        }
        

    async retrieveUserTimeOfWork(data: EditUserTimeOfWorkDto, userId: number): Promise<TimeOfWorke[] | ApiResponse> {
        const checkedScop = await this.administratorEntitets.findOne({ where: { userId: data.userId, visibility: 1, managerId: userId } });
        if(!checkedScop){
            return new ApiResponse("error", 404, "Administrator for this user is not found");
        }
        const getDate = data.dateEndTime.split(" ")[0];
        const excangeDate = dataUtils(data.dateEndTime);
        const checkedInDate = new Date(getDate);
        
        try {
            const result = await this.timeOfWorkeEntitets.createQueryBuilder("time_of_works")
                .where("DATE(time_of_works.checked_in) = :checked_in", { checked_in: checkedInDate.toISOString().split('T')[0] })
                .andWhere("time_of_works.user_id = :userId", { userId: data.userId })
                .andWhere("time_of_works.status = :status", { status: 0 })
                .getMany();

            if (!result || result.length === 0) {
                return new ApiResponse("error", 404, "Time of work for this user is not exists");
            }

            return result;
        } catch (err: unknown) {
            this.logger.error('Failed to fetch time of work', err instanceof Error ? err.stack : err);
            return new ApiResponse("error", 500, "Failed to fetch time of work");
        }
    }
    //Refactor this function to use the updateUserTimeOfWork function. Cheched how it recive the data and time for end
    async updateUserTimeOfWork(userId: number, data: EditUserTimeOfWorkDto): Promise<TimeOfWorke | ApiResponse> {
        const checkedScop = await this.administratorEntitets.createQueryBuilder("administrator")
            .where("administrator.userId = :userId", { userId: data.userId })
            .andWhere("administrator.role = :role", { role: Role.USER })
            .andWhere("administrator.visibility = :visibility", { visibility: 1 })
            .andWhere("administrator.manager_id = :managerId", { managerId: userId })
            .getOne();

        if(!checkedScop){
            return new ApiResponse("error", 404, "Administrator for this user is not found");
        }

        try {
            const getDate = data.dateEndTime.split(" ")[0];
            const excangeDate = dataUtils(data.dateEndTime);
            const checkedInDate = new Date(getDate);
            
            const result = await this.timeOfWorkeEntitets.createQueryBuilder("time_of_works")
                .where("DATE(time_of_works.checked_in) = :checked_in", { checked_in: checkedInDate.toISOString().split('T')[0] })
                .andWhere("time_of_works.user_id = :userId", { userId: data.userId })
                .andWhere("time_of_works.status = :status", { status: 0 })
                .getOne();

            if (!result) {
                return new ApiResponse("error", 404, "Time of work for this user is not found");
            }

            result.checked_out = excangeDate;

            const updated = await this.timeOfWorkeEntitets.save(result);
            return updated;
        } catch (err: unknown) {
            this.logger.error('Failed to update time of work', err instanceof Error ? err.stack : err);
            return new ApiResponse("error", 500, "Failed to update time of work");
        }
    }

    async deleteUserTimeOfWork(data: DeleteUserTimeOfWorkDto, userId: number): Promise<TimeOfWorke | ApiResponse | any>{
        const checkedScop = await this.administratorEntitets.findOne({ where: { userId: data.userId, visibility: 1, managerId: userId } });
        if(!checkedScop){
            return new ApiResponse("error", 404, "Administrator for this user is not found");
        }
        const getTimeOfWorForUser = await this.timeOfWorkeEntitets.findOne({ where: { timeOfWorkeId: data.timeOfWorkeId, user: { userId: data.userId } as Users } });

        if(!getTimeOfWorForUser){
            return new ApiResponse("error", 404, "Time of work for this user is not exists");
        }

        if(getTimeOfWorForUser.status === data.status){
            return new ApiResponse("error", 409, "Time of work for this user is already in this status");
        }

        const deleteTimeOfWorkUser = await  this.timeOfWorkeEntitets.update({ timeOfWorkeId: data.timeOfWorkeId }, { status: data.status });

        if(deleteTimeOfWorkUser.affected === 0){
            return new ApiResponse("error", 400, "Can not delete time of work for this user");
        }

        const getUpdateTimeOfWork = await this.timeOfWorkeEntitets.findOne({ where: { timeOfWorkeId: data.timeOfWorkeId } });

        return getUpdateTimeOfWork;
    }

    async administratrosDecideUserVaction(adminId: number): Promise<RequestVacationDto[] | ApiResponse>{
        const getAllserVactionRequests = await this.vacationsEntitets.find({
            where: { status: 1, user: { managerId: adminId } },
            relations: { user: true }
        });
        
        const curentRquestsUserVactions: RequestVacationDto[] = [];

        for(const requests of getAllserVactionRequests){
            curentRquestsUserVactions.push({
                vacationId: requests.vacationId,
                vacation_start: requests.vacation_start.toISOString(),
                vacation_end: requests.vacation_end.toISOString(),
                userId: requests.user.userId,
                admin: adminId,
                reason: requests.reason,
                status: requests.status,
                admin_comment: requests.admin_comment ?? undefined,
                user_comment: requests.user_comment ?? undefined
            });
        }

        if(curentRquestsUserVactions.length === 0){
            return new ApiResponse("error", 404, "No vacation requests found!");
        }

        return curentRquestsUserVactions;
    }

    async editUserVactionbyAdmin(data:DecideVacationDto, adminId: number): Promise<Vacations | ApiResponse>{
        const vactionResutl = await this.vacationsEntitets.findOne({
            where: { vacationId: data.vacationId },
            relations: { user: true },
        });

        if(!vactionResutl){
            return new ApiResponse("error", 404, "Vacation request not found!");
        }

        if(vactionResutl.status === data.status){
            return new ApiResponse("error", 409, "Vacation request is already in this status!");
        }

        if(vactionResutl.user?.managerId !== adminId){
            return new ApiResponse("error", 403, "You are not authorized to update this vacation request!");
        }

        vactionResutl.status = data.status;
        vactionResutl.admin_comment = data.admin_comment ?? null;

        const updateVacationRequest = await this.vacationsEntitets.save(vactionResutl);

        if(!updateVacationRequest){
            return new ApiResponse("error", 500, "Failed to update vacation request!");
        }

        return updateVacationRequest;
    }
}