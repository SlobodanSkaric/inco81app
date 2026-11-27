import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { ApiResponse } from 'src/misc/api.response.dto';
import { DataSource, EntityManager, IsNull, Not, Repository } from 'typeorm';
import { GetHorseDto } from './dtos/get.horse.dto';
import { UdateTimeOfWorkUserDto } from './dtos/udate.timeofwork.user.dto';
import { calendarDateKey, calendarRangeBounds, clippedOverlapMs, curentDateFormatToISOString, dataUtils } from 'src/utils/data.utils';
import { Users } from 'src/entitets/entities/Users';
import { Role } from 'src/common/enums/role.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheIvalidationEvent } from 'src/common/events/cahce.events';
import { runInTransaction, txAbort } from 'src/misc/transaction.abort';

@Injectable()
export class TimeofworkService {
    constructor(
        @InjectRepository(TimeOfWorke) private readonly timeOfWorksRepository: Repository<TimeOfWorke>,
        private readonly dataSource: DataSource,
        private readonly eventEmitter: EventEmitter2,
    ){}

    private isDuplicateKeyError(error: unknown): boolean {
        if (!(error instanceof Object)) {
            return false;
        }
        const err = error as { errno?: number; code?: string };
        return err.errno === 1062 || err.code === "ER_DUP_ENTRY" || err.errno === 23505;
    }

    private findOpenShift(manager: EntityManager, userId: number): Promise<TimeOfWorke | null> {
        return manager.getRepository(TimeOfWorke).findOne({
            where: {
                user: { userId } as Users,
                status: 0,
                checked_in: Not(IsNull()),
                checked_out: IsNull(),
            },
            order: { checked_in: "DESC" },
        });
    }

    private invalidateTimeOfWorkCache(ownerUserId: number, managerId?: number | null): void {
        const keys: string[] = [`user:${ownerUserId}:/timeofwork`];
        if (managerId != null) {
            keys.push(`administrator:${managerId}:/user/all`);
        }
        this.eventEmitter.emit(
            "cache.invalidate",
            new CacheIvalidationEvent(
                keys,
                [
                    `user:${ownerUserId}:/timeofwork/*`,
                    "administrator:*:/timeofwork/*",
                    "superadministrator:*:/timeofwork/*",
                    "administrator:*:/user/all",
                    "administrator:*:/administrator/*",
                ],
                "TimeOfWorke",
                "update",
            ),
        );
    }

    private async lockUser(manager: EntityManager, userId: number): Promise<Users | null> {
        return manager.getRepository(Users).findOne({
            where: { userId },
            lock: { mode: "pessimistic_write" },
        });
    }

    async userCheckedIn(userId: number): Promise<TimeOfWorke | ApiResponse>{
        try {
            const result = await runInTransaction(this.dataSource, async (manager) => {
                const user = await this.lockUser(manager, userId);
                if (!user) {
                    txAbort("error", 404, "Korisnik ne postoji");
                }

                const openShift = await this.findOpenShift(manager, userId);
                if (openShift) {
                    txAbort("error", 409, "Korisnik je vec prijavljen");
                }

                const timeOfWork = manager.create(TimeOfWorke, {
                    user: { userId } as Users,
                    status: 0,
                    checked_in: new Date(),
                });

                const savedTimeOfWork = await manager.save(timeOfWork);
                if (!savedTimeOfWork) {
                    txAbort("error", 500, "Ne mogu da se prijavim");
                }

                return { savedTimeOfWork, managerId: user.managerId };
            });

            if (result instanceof ApiResponse) {
                return result;
            }

            this.invalidateTimeOfWorkCache(userId, result.managerId);
            return result.savedTimeOfWork;
        } catch (error) {
            if (this.isDuplicateKeyError(error)) {
                return new ApiResponse("error", 409, "Korisnik je vec prijavljen");
            }
            throw error;
        }
    }

    async userCheckedOut(userId: number): Promise<TimeOfWorke | ApiResponse>{
        const result = await runInTransaction(this.dataSource, async (manager) => {
            const user = await this.lockUser(manager, userId);
            if (!user) {
                txAbort("error", 404, "Korisnik ne postoji");
            }

            const openShift = await this.findOpenShift(manager, userId);
            if (!openShift) {
                txAbort("error", 400, "Korisnik nije prijavljen");
            }

            openShift.checked_out = new Date();

            const savedTimeOfWork = await manager.save(openShift);
            if (!savedTimeOfWork) {
                txAbort("error", 500, "Ne mogu da se odjavim");
            }

            return { savedTimeOfWork, managerId: user.managerId };
        });

        if (result instanceof ApiResponse) {
            return result;
        }

        this.invalidateTimeOfWorkCache(userId, result.managerId);
        return result.savedTimeOfWork;
    }

    async getTiemOfWorkByUserId(data: GetHorseDto, userId: number): Promise<{getOfTime: string, problems?: string[]} | ApiResponse>{
        if(!data.startDate || !data.endDate){
            return new ApiResponse("error", 400, "Date and time are required");
        }

        const startDate = calendarDateKey(data.startDate);
        const endDate = calendarDateKey(data.endDate);
        if(!startDate || !endDate){
            return new ApiResponse("error", 400, "Invalid date format");
        }
        if(startDate > endDate){
            return new ApiResponse("error", 400, "Start date must not be after end date");
        }

        const today = curentDateFormatToISOString();
        if(startDate > today){
            return new ApiResponse("error", 400, "Start date must be in the past");
        }
        if(endDate > today){
            return new ApiResponse("error", 400, "End date must not be in the future");
        }

        const timeOfWork = await this.timeOfWorksRepository.createQueryBuilder("time_of_worke")
        .where("time_of_worke.user_id = :userId", { userId: userId })
        .andWhere("time_of_worke.checked_in IS NOT NULL")
        .andWhere("DATE(time_of_worke.checked_in) <= :endDate", { endDate })
        .andWhere("time_of_worke.status = 0")
        .andWhere("(time_of_worke.checked_out IS NULL OR DATE(time_of_worke.checked_out) >= :startDate)",
            { startDate })
        .getMany();
        
        if(timeOfWork.length === 0){
            return {getOfTime: "0"}
        }

        const { start: rangeStart, end: rangeEnd } = calendarRangeBounds(startDate, endDate);
        let sumTime = 0;
        let timeProblem: string[] = [];

        for (const element of timeOfWork) {
            if (element.checked_out === null) {
                timeProblem.push(`Korisnik nije odradio sve radne sate koji su poceli ${element.checked_in}`);
                continue;
            }
            sumTime += clippedOverlapMs(element.checked_in, element.checked_out, rangeStart, rangeEnd);
        }

        let totalHouerse = Number((sumTime / (1000 * 60 * 60)).toFixed(2));
        let sufix = "H";

        if (totalHouerse > 0 && totalHouerse < 1) {
            sufix = "min";
            totalHouerse = Math.round(totalHouerse * 60);
        }

        return { getOfTime: totalHouerse.toString() + sufix , problems: timeProblem }

    }

    async getInfoTimeOfWork(id: number, requesterId: number, role: Role): Promise<TimeOfWorke | ApiResponse>{
        const timeOfWork = await this.timeOfWorksRepository.findOne({
            where: { timeOfWorkeId: id },
            relations: { user: true },
        });

        if(!timeOfWork){
            return new ApiResponse("error", 404, "Time of work for this id is not exists");
        }

        const ownerId = timeOfWork.user?.userId;
        const managerId = timeOfWork.user?.managerId;

        if (role === Role.SUPER_ADMIN) {
            return timeOfWork;
        }

        if (role === Role.ADMIN) {
            if (ownerId !== requesterId && managerId !== requesterId) {
                return new ApiResponse("error", 403, "You are not authorized to view this time of work");
            }
            return timeOfWork;
        }

        if (ownerId !== requesterId) {
            return new ApiResponse("error", 403, "You are not authorized to view this time of work");
        }

        return timeOfWork;
    }

    async updateUserTimeOfWork(data: UdateTimeOfWorkUserDto, userAdminId: number): Promise<TimeOfWorke | ApiResponse | null>{
        if(!data.dateStartTime && !data.dateEndTime){
            return new ApiResponse("error", 400, "Date start time and date end time are required");
        }

       let parsedStartTime: Date | undefined;
       let parsedEndTime: Date | undefined;

       try{
        if(data.dateStartTime) parsedStartTime = dataUtils(data.dateStartTime);
        if(data.dateEndTime) parsedEndTime = dataUtils(data.dateEndTime);
       }catch(error){
        return new ApiResponse("error", 400, "Invalid date format");
       }

       const result = await runInTransaction(this.dataSource, async(manager) =>{
            const timeOfWork = await manager.getRepository(TimeOfWorke).findOne({
                where: { timeOfWorkeId: data.id},
                relations: { user: true },
            });

            if(!timeOfWork){
                 txAbort("error", 404, "Time of work for this id is not exists");
            }
            if(timeOfWork.user?.managerId !== userAdminId){
                 txAbort("error", 403, "You are not authorized to update this time of work");
            }

            const ownerUserId = timeOfWork.user?.userId;

            if(ownerUserId == null){
                txAbort("error", 404, "User not found");
            }

            const lockUser = await this.lockUser(manager, ownerUserId);

            if(lockUser == null){
                txAbort("error", 404, "User not found");
            }

            if(lockUser.managerId !== userAdminId){
                txAbort("error", 403, "You are not authorized to update this time of work");
            }

            const checkedIn = parsedStartTime ?? timeOfWork.checked_in;
            const checkedOut = parsedEndTime ?? timeOfWork.checked_out;

            if(checkedIn && checkedOut && checkedIn.getTime() > checkedOut.getTime()){
                txAbort("error", 400, "Start time must be before end time");
            }

            if(checkedIn){
                const overlap = await manager.getRepository(TimeOfWorke)
                .createQueryBuilder("time_of_worke")
                .where("time_of_worke.user_id = :userId", { userId: ownerUserId })
                .andWhere("time_of_worke.timeOfWorkeId != :timeOfWorkeId", { timeOfWorkeId: data.id })
                .andWhere("time_of_worke.status = :status", { status: 0 })
                .andWhere("time_of_worke.checked_in IS NOT NULL")
                .andWhere("time_of_worke.checked_in < :end", {end: checkedOut ?? new Date("9999-12-31T23:59:59")})
                .andWhere("time_of_worke.checked_out IS NULL OR time_of_worke.checked_out > :start", {start: checkedIn})
                .getOne();

                if(overlap){
                    txAbort("error", 400, "Time of work is already exists");
                }
            }

            const upodateTimeOfWork = await manager.getRepository(TimeOfWorke)
               .createQueryBuilder("time_of_worke")
               .where("time_of_worke.timeOfWorkeId = :id", { id: data.id })
               .update(TimeOfWorke)
               .set({
                checked_in: checkedIn,
                checked_out: checkedOut,
               })
               .where("time_of_worke.timeOfWorkeId = :timeOfWorkeId", { timeOfWorkeId: data.id })
               .execute();

            if(upodateTimeOfWork.affected === 0){
                txAbort("error", 500, "Failed to update time of work");
            }

            const update = await manager.getRepository(TimeOfWorke).findOne({
                where: { timeOfWorkeId: data.id },
                relations: { user: true },
            });

            if(!update){
                return new ApiResponse("error", 404, "Time of work not found");
            }
            
            return { update,  ownerUserId};          
            
       });

       if(result instanceof ApiResponse){
        return result;
       }

       this.invalidateTimeOfWorkCache(result.ownerUserId, userAdminId);
       return result.update;
   }
}
