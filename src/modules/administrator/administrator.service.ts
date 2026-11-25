import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
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
import { VACATION_DECISION_STATUSES, VacationStatus } from '../vacation/dto/vacation.status.enum';
import { calendarDateKey } from 'src/utils/data.utils';
import { VacationService } from '../vacation/vacation.service';
import { VactionRequestUpdatedEvent } from '../vacation/events/vaction.events.def';
import { softDeleteEmail, softDeletePhone } from 'src/utils/soft.delete.identity';
import { runInTransaction, txAbort } from 'src/misc/transaction.abort';

@Injectable()
export class AdministratorService {
    private readonly logger = new Logger(AdministratorService.name);

    constructor(
        @InjectRepository(Users) private readonly administratorEntitets: Repository<Users>,
        @InjectRepository(TimeOfWorke) private readonly timeOfWorkeEntitets: Repository<TimeOfWorke>,
        @InjectRepository(Vacations) private readonly vacationsEntitets: Repository<Vacations>,
        private readonly eventEmmiter: EventEmitter2,
        private readonly dataSource: DataSource,
        private readonly vacationService: VacationService,
    ){}

    async getAllAdmin(): Promise<AdministratorInfoDto[] | ApiResponse>{
        const getAdmin = await this.administratorEntitets.find({ where: { role: Role.ADMIN, visibility: 1 } });

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
        const admins = await this.administratorEntitets.findOne({ where : { email: email.trim().toLowerCase(), role: Role.ADMIN } });

        if(!admins){
            return null;
        }

        return admins;
    }


    async getById(id): Promise<AdministratorInfoDto | ApiResponse>{
        const getAdmin = await this.administratorEntitets.findOne({
            where: { userId: id, role: Role.ADMIN, visibility: 1 },
        });

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
        admin.email = data.email.trim().toLowerCase();
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
            const result = await this.dataSource.transaction(async (manager) => {
                const admin = await manager.findOne(Users, {
                    where: { userId: id, role: Role.ADMIN, visibility: 1 },
                    lock: { mode: "pessimistic_write" },
                });
                if (!admin) {
                    return null;
                }

                admin.visibility = 0;
                admin.email = softDeleteEmail(admin.email, admin.userId);
                if (admin.phonenumber) {
                    admin.phonenumber = softDeletePhone(admin.phonenumber, admin.userId);
                }
                await manager.save(admin);

                const superAdmin = await manager.findOne(Users, {
                    where: { role: Role.SUPER_ADMIN, visibility: 1 },
                    order: { userId: "ASC" },
                });
                const reassignTo = superAdmin?.userId ?? null;
                await manager
                    .createQueryBuilder()
                    .update(Users)
                    .set({ managerId: reassignTo })
                    .where("manager_id = :id", { id: admin.userId })
                    .andWhere("role = :role", { role: Role.USER })
                    .execute();

                const openShifts = await manager.find(TimeOfWorke, {
                    where: {
                        user: { userId: admin.userId },
                        status: 0,
                        checked_in: Not(IsNull()),
                        checked_out: IsNull(),
                    },
                });
                for (const shift of openShifts) {
                    shift.checked_out = shift.checked_in ?? new Date();
                    shift.status = 1;
                    await manager.save(shift);
                }

                return admin;
            });

            if(result){
                await this.eventEmmiter.emitAsync("auth.sessions.revoked", new SessionsRevokedEvent(result.userId.toString(), Role.ADMIN));
                this.eventEmmiter.emit("cache.invalidate",
                    new CacheIvalidationEvent(
                        [
                            `administrator:${result.userId}:/administrator`,
                            `administrator:${result.userId}:/administrator/`,
                        ],
                        [
                            "administrator:*:/administrator/all",
                            "administrator:*:/user/all",
                            "superadministrator:*:/administrator/all",
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
        

    private async assertManagedUser(employeeUserId: number, managerId: number): Promise<Users | ApiResponse> {
        const checkedScop = await this.administratorEntitets.findOne({
            where: { userId: employeeUserId, role: Role.USER, visibility: 1, managerId },
        });
        if (!checkedScop) {
            return new ApiResponse("error", 404, "Administrator for this user is not found");
        }
        return checkedScop;
    }

    private calendarDayFromDateTimeInput(dateEndTime: string): string | ApiResponse {
        const day = calendarDateKey(dateEndTime.split(" ")[0] ?? dateEndTime);
        if (!day) {
            return new ApiResponse("error", 400, "Invalid date format");
        }
        return day;
    }

    async retrieveUserTimeOfWork(data: EditUserTimeOfWorkDto, userId: number): Promise<TimeOfWorke[] | ApiResponse> {
        const checkedScop = await this.assertManagedUser(data.userId, userId);
        if (checkedScop instanceof ApiResponse) {
            return checkedScop;
        }

        const checkedInDay = this.calendarDayFromDateTimeInput(data.dateEndTime);
        if (checkedInDay instanceof ApiResponse) {
            return checkedInDay;
        }
        
        try {
            const result = await this.timeOfWorkeEntitets.createQueryBuilder("time_of_works")
                .where("DATE(time_of_works.checked_in) = :checked_in", { checked_in: checkedInDay })
                .andWhere("time_of_works.user_id = :userId", { userId: data.userId })
                .andWhere("time_of_works.status = :status", { status: 0 })
                .orderBy("time_of_works.checked_in", "ASC")
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
        const checkedScop = await this.assertManagedUser(data.userId, userId);
        if (checkedScop instanceof ApiResponse) {
            return checkedScop;
        }

        try {
            let excangeDate: Date;
            try {
                excangeDate = dataUtils(data.dateEndTime);
            } catch {
                return new ApiResponse("error", 400, "Invalid date and time format. Use YYYY-MM-DD HH:mm:ss");
            }

            const checkedInDay = this.calendarDayFromDateTimeInput(data.dateEndTime);
            if (checkedInDay instanceof ApiResponse) {
                return checkedInDay;
            }
            
            const result = await this.timeOfWorkeEntitets.createQueryBuilder("time_of_works")
                .where("DATE(time_of_works.checked_in) = :checked_in", { checked_in: checkedInDay })
                .andWhere("time_of_works.user_id = :userId", { userId: data.userId })
                .andWhere("time_of_works.status = :status", { status: 0 })
                .andWhere("time_of_works.checked_out IS NULL")
                .orderBy("time_of_works.checked_in", "DESC")
                .getOne();

            if (!result) {
                return new ApiResponse("error", 404, "Time of work for this user is not found");
            }

            if (result.checked_in && excangeDate.getTime() < result.checked_in.getTime()) {
                return new ApiResponse("error", 400, "checked_out must be after checked_in");
            }

            if (result.checked_in) {
                const overlap = await this.timeOfWorkeEntitets
                    .createQueryBuilder("t")
                    .where("t.user_id = :userId", { userId: data.userId })
                    .andWhere("t.timeOfWorkeId != :id", { id: result.timeOfWorkeId })
                    .andWhere("t.status = :status", { status: 0 })
                    .andWhere("t.checked_in IS NOT NULL")
                    .andWhere("t.checked_in < :end", { end: excangeDate })
                    .andWhere("(t.checked_out IS NULL OR t.checked_out > :start)", { start: result.checked_in })
                    .getOne();

                if (overlap) {
                    return new ApiResponse(
                        "error",
                        409,
                        "Updated shift overlaps another time-of-work entry",
                    );
                }
            }

            result.checked_out = excangeDate;

            const updated = await this.timeOfWorkeEntitets.save(result);

            this.eventEmmiter.emit(
                "cache.invalidate",
                new CacheIvalidationEvent(
                    [`user:${data.userId}:/timeofwork`, `administrator:${userId}:/user/all`],
                    [
                        `user:${data.userId}:/timeofwork/*`,
                        "administrator:*:/timeofwork/*",
                        "superadministrator:*:/timeofwork/*",
                        "administrator:*:/user/all",
                    ],
                    "TimeOfWorke",
                    "update",
                ),
            );
            return updated;
        } catch (err: unknown) {
            this.logger.error('Failed to update time of work', err instanceof Error ? err.stack : err);
            return new ApiResponse("error", 500, "Failed to update time of work");
        }
    }

    async deleteUserTimeOfWork(data: DeleteUserTimeOfWorkDto, userId: number): Promise<TimeOfWorke | ApiResponse | any>{
        const checkedScop = await this.assertManagedUser(data.userId, userId);
        if (checkedScop instanceof ApiResponse) {
            return checkedScop;
        }
        const getTimeOfWorForUser = await this.timeOfWorkeEntitets.findOne({ where: { timeOfWorkeId: data.timeOfWorkeId, user: { userId: data.userId } as Users } });

        if(!getTimeOfWorForUser){
            return new ApiResponse("error", 404, "Time of work for this user is not exists");
        }

        if(getTimeOfWorForUser.status === data.status){
            return new ApiResponse("error", 409, "Time of work for this user is already in this status");
        }

        // Soft-delete must also close an open shift so open_user_id clears via
        // checked_out (not only status) and the row is not left as a ghost open shift.
        const patch: Partial<TimeOfWorke> = { status: data.status };
        if (
            data.status !== 0 &&
            getTimeOfWorForUser.checked_out == null &&
            getTimeOfWorForUser.checked_in != null
        ) {
            patch.checked_out = getTimeOfWorForUser.checked_in;
        }

        const deleteTimeOfWorkUser = await this.timeOfWorkeEntitets.update(
            { timeOfWorkeId: data.timeOfWorkeId },
            patch,
        );

        if(deleteTimeOfWorkUser.affected === 0){
            return new ApiResponse("error", 400, "Can not delete time of work for this user");
        }

        const getUpdateTimeOfWork = await this.timeOfWorkeEntitets.findOne({ where: { timeOfWorkeId: data.timeOfWorkeId } });

        return getUpdateTimeOfWork;
    }

    async administratrosDecideUserVaction(
        adminId: number,
        role: Role = Role.ADMIN,
    ): Promise<RequestVacationDto[] | ApiResponse>{
        const where =
            role === Role.SUPER_ADMIN
                ? { status: VacationStatus.PENDING, user: { visibility: 1 } }
                : { status: VacationStatus.PENDING, user: { managerId: adminId, visibility: 1 } };

        const getAllserVactionRequests = await this.vacationsEntitets.find({
            where,
            relations: { user: true }
        });
        
        const curentRquestsUserVactions: RequestVacationDto[] = [];

        for(const requests of getAllserVactionRequests){
            if (!requests.vacation_start || !requests.vacation_end || !requests.user) {
                this.logger.warn(`Skipping malformed vacation ${requests.vacationId}`);
                continue;
            }
            curentRquestsUserVactions.push({
                vacationId: requests.vacationId,
                vacation_start: requests.vacation_start.toISOString(),
                vacation_end: requests.vacation_end.toISOString(),
                userId: requests.user.userId,
                admin: requests.user.managerId ?? adminId,
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

    async editUserVactionbyAdmin(
        data: DecideVacationDto,
        adminId: number,
        role: Role = Role.ADMIN,
    ): Promise<Vacations | ApiResponse>{
        if (!VACATION_DECISION_STATUSES.includes(data.status)) {
            return new ApiResponse("error", 400, "Status must be approved (2) or rejected (3)");
        }

        const result = await runInTransaction(this.dataSource, async (manager) => {
            const vactionResutl = await manager.findOne(Vacations, {
                where: { vacationId: data.vacationId },
                relations: { user: true },
                lock: { mode: "pessimistic_write" },
            });

            if (!vactionResutl) {
                txAbort("error", 404, "Vacation request not found!");
            }

            if (vactionResutl.status !== VacationStatus.PENDING) {
                txAbort("error", 409, "Only pending vacation requests can be decided!");
            }

            if (!vactionResutl.user || vactionResutl.user.visibility !== 1) {
                txAbort("error", 400, "Cannot decide vacation for a hidden or missing user");
            }

            const isSuper = role === Role.SUPER_ADMIN;
            if (!isSuper && vactionResutl.user.managerId !== adminId) {
                txAbort("error", 403, "You are not authorized to update this vacation request!");
            }

            if (vactionResutl.user?.userId != null) {
                await manager.findOne(Users, {
                    where: { userId: vactionResutl.user.userId },
                    lock: { mode: "pessimistic_write" },
                });
            }

            if (
                data.status === VacationStatus.APPROVED &&
                vactionResutl.vacation_start &&
                vactionResutl.vacation_end &&
                vactionResutl.user
            ) {
                const overlap = await this.vacationService.hasApprovedOverlap(
                    manager,
                    vactionResutl.user.userId,
                    vactionResutl.vacation_start,
                    vactionResutl.vacation_end,
                    vactionResutl.vacationId,
                );
                if (overlap) {
                    txAbort(
                        "error",
                        409,
                        "Cannot approve: overlapping approved vacation already exists",
                    );
                }
            }

            vactionResutl.status = data.status;
            vactionResutl.admin_comment = data.admin_comment ?? null;

            const updateVacationRequest = await manager.save(vactionResutl);
            if (!updateVacationRequest) {
                txAbort("error", 500, "Failed to update vacation request!");
            }

            return updateVacationRequest;
        });

        if (!(result instanceof ApiResponse)) {
            this.vacationService.invalidateVacationCache(result.user?.userId ?? 0, result.user?.managerId);
        }

        if (!(result instanceof ApiResponse) && result.user) {
            const statusLabel =
                result.status === VacationStatus.APPROVED
                    ? "approved"
                    : result.status === VacationStatus.REJECTED
                      ? "rejected"
                      : "pending";
            this.eventEmmiter.emit(
                "vacation.request.updated",
                new VactionRequestUpdatedEvent(
                    result.vacationId,
                    result.user.userId,
                    result.user.email,
                    statusLabel,
                    result.admin_comment ?? undefined,
                ),
            );
        }

        return result;
    }
}
