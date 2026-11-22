import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { ApiResponse } from 'src/misc/api.response.dto';
import { DataSource, EntityManager, IsNull, Not, Repository } from 'typeorm';
import { GetHorseDto } from './dtos/get.horse.dto';
import { UdateTimeOfWorkUserDto } from './dtos/udate.timeofwork.user.dto';
import { curentDateFormatToISOString, dataUtils } from 'src/utils/data.utils';
import { Users } from 'src/entitets/entities/Users';

@Injectable()
export class TimeofworkService {
    constructor(
        @InjectRepository(TimeOfWorke) private readonly timeOfWorksRepository: Repository<TimeOfWorke>,
        private readonly dataSource: DataSource,
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

    private async lockUser(manager: EntityManager, userId: number): Promise<Users | null> {
        return manager.getRepository(Users).findOne({
            where: { userId },
            lock: { mode: "pessimistic_write" },
        });
    }

    async userCheckedIn(userId: number): Promise<TimeOfWorke | ApiResponse>{
        try {
            return await this.dataSource.transaction(async (manager) => {
                const user = await this.lockUser(manager, userId);
                if (!user) {
                    return new ApiResponse("error", 404, "Korisnik ne postoji");
                }

                const openShift = await this.findOpenShift(manager, userId);
                if (openShift) {
                    return new ApiResponse("error", 409, "Korisnik je vec prijavljen");
                }

                const timeOfWork = manager.create(TimeOfWorke, {
                    user: { userId } as Users,
                    status: 0,
                    checked_in: new Date(),
                });

                const savedTimeOfWork = await manager.save(timeOfWork);
                if (!savedTimeOfWork) {
                    return new ApiResponse("error", 500, "Ne mogu da se prijavim");
                }

                return savedTimeOfWork;
            });
        } catch (error) {
            if (this.isDuplicateKeyError(error)) {
                return new ApiResponse("error", 409, "Korisnik je vec prijavljen");
            }
            throw error;
        }
    }

    async userCheckedOut(userId: number): Promise<TimeOfWorke | ApiResponse>{
        return await this.dataSource.transaction(async (manager) => {
            const user = await this.lockUser(manager, userId);
            if (!user) {
                return new ApiResponse("error", 404, "Korisnik ne postoji");
            }

            const openShift = await this.findOpenShift(manager, userId);
            if (!openShift) {
                return new ApiResponse("error", 400, "Korisnik nije prijavljen");
            }

            openShift.checked_out = new Date();

            const savedTimeOfWork = await manager.save(openShift);
            if (!savedTimeOfWork) {
                return new ApiResponse("error", 500, "Ne mogu da se odjavim");
            }

            return savedTimeOfWork;
        });
    }

    async getTiemOfWorkByUserId(data: GetHorseDto, userId: number): Promise<{getOfTime: string, problems?: string[]} | ApiResponse>{
        if(!data.startDate || !data.endDate){
            return new ApiResponse("error", 400, "Date and time are required");
        }
        if(data.startDate >= data.endDate){
            return new ApiResponse("error", 400, "Start date must be before end date");
        }

        if(data.startDate > curentDateFormatToISOString()){
            return new ApiResponse("error", 400, "Start date must be in the past");
        }
        if(data.endDate > curentDateFormatToISOString()){
            return new ApiResponse("error", 400, "End date must be in the past");
        }
       

        const checkedUser = await this.timeOfWorksRepository.find({ where: { user : { userId: userId}} });

        if(checkedUser.length === 0){
            return { getOfTime: "Undefind user" }
        }
        
            
        const timeOfWork = await this.timeOfWorksRepository.createQueryBuilder("time_of_worke")
        .where("time_of_worke.user_id = :userId", { userId: userId })
        .andWhere("time_of_worke.checked_in IS NOT NULL")
        .andWhere("time_of_worke.checked_in <= :endDate", { endDate: data.endDate })
        .andWhere("time_of_worke.status = 0")
        .andWhere("(time_of_worke.checked_out IS NULL OR time_of_worke.checked_out >= :startDate)", 
            { startDate: data.startDate })
        .getMany();
        
        if(timeOfWork.length === 0){
            return {getOfTime: "0"}
        }

        let sumTime = 0;
        let timeProblem: string[] = [];

        for (const element of timeOfWork) {
            if (element.checked_out === null) {
                timeProblem.push(`Korisnik nije odradio sve radne sate koji su poceli ${element.checked_in}`);
                continue;
            }
            sumTime += element.checked_out.getTime() - element.checked_in.getTime();
        }

        let totalHouerse = Number((sumTime / (1000 * 60 * 60)).toFixed(2));
        let sufix = "H";

        if (totalHouerse < 1) {
            sufix = "min";
            totalHouerse = Math.round(totalHouerse * 60);
        }

        return { getOfTime: totalHouerse.toString() + sufix , problems: timeProblem ? timeProblem : [] }

    }

    async getInfoTimeOfWork(id: number, userId: number): Promise<TimeOfWorke | ApiResponse>{
        const timeOfWork = await this.timeOfWorksRepository.findOne({ where: { timeOfWorkeId: id, user: { userId: userId } } });

        if(!timeOfWork){
            return new ApiResponse("error", 404, "Time of work for this id is not exists");
        }

        return timeOfWork;
    }

    async updateUserTimeOfWork(data: UdateTimeOfWorkUserDto, userId: number): Promise<TimeOfWorke | ApiResponse | null>{
        const timeOfWork = await this.timeOfWorksRepository.findOne({
            where: { timeOfWorkeId: data.id },
            relations: { user: true },
        });

        if(!timeOfWork){
            return new ApiResponse("error", 404, "Time of work for this id is not exists");
        }

        if(timeOfWork.user?.managerId !== userId){
            return new ApiResponse("error", 403, "You are not authorized to update this time of work");
        }

        const result = await this.timeOfWorksRepository.createQueryBuilder()
                        .update(TimeOfWorke)
                        .set({
                            checked_in: dataUtils(data.dateStartTime) ? dataUtils(data.dateStartTime) : () => "checked_in",
                            checked_out: dataUtils(data.dateEndTime) ? dataUtils(data.dateEndTime) : () => "checked_out"
                        })
                        .where("timeOfWorkeId = :id", { id: data.id })
                        .execute();

        if(result.affected === 0){
            return new ApiResponse("error", 404, "Time of work for this id is not exists");
        }

        return await this.timeOfWorksRepository.findOne({ where: { timeOfWorkeId: data.id } });
    }

    async deleteUserTimeOfWork(){}
}
