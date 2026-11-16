import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Between, IsNull, Repository } from 'typeorm';
import { UserCheckedInDto } from './dtos/user.checkedin.dto';
import { GetHorseDto } from './dtos/get.horse.dto';
import { UdateTimeOfWorkUserDto } from './dtos/udate.timeofwork.user.dto';
import { curentDateFormatToISOString, dataUtils } from 'src/utils/data.utils';
import { Users } from 'src/entitets/entities/Users';

@Injectable()
export class TimeofworkService {
    constructor(@InjectRepository(TimeOfWorke) private readonly timeOfWorksRepository: Repository<TimeOfWorke>){}

    async userCheckedIn(userId: number): Promise<TimeOfWorke | ApiResponse>{
        const checkedUser = await this.timeOfWorksRepository.findOne({
            where : {
                user: { userId:userId } as Users,
                checked_out: IsNull()
            }
        })

        if(checkedUser){
            return new ApiResponse("error", 409, "Korisnik je vec prijavljen");
        }



        const timeOfWork = new TimeOfWorke();
        timeOfWork.user = { userId: userId } as Users;
        timeOfWork.checked_in = new Date();

        const savedTimeOfWork = await this.timeOfWorksRepository.save(timeOfWork);
        if(!savedTimeOfWork){
            return new ApiResponse("error", 500, "Ne mogu da se prijavim");
        }


        return savedTimeOfWork;
    }    



    async userCheckedOut(userId: number): Promise<TimeOfWorke | ApiResponse>{
        const checkedUser = await this.timeOfWorksRepository.findOne({
            where : {
                user: { userId: userId } as Users,
                checked_out: IsNull()
            }
        })

        if(!checkedUser){
            return new ApiResponse("error", 400, "Korisnik nije prijavljen");
        }

        checkedUser.checked_out = new Date();

        const savedTimeOfWork = await this.timeOfWorksRepository.save(checkedUser);
        if(!savedTimeOfWork){
            return new ApiResponse("error", 500, "Ne mogu da se odjavim");
        }

        return savedTimeOfWork;
    }

    async getTiemOfWorkByUserId(data: GetHorseDto): Promise<{getOfTime: string, problems?: string[]} | ApiResponse>{
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
       

        const checkedUser = await this.timeOfWorksRepository.find({ where: { user : { userId: data.userId }} });

        if(checkedUser.length === 0){
            return { getOfTime: "Undefind user" }
        }
        
            
        const timeOfWork = await this.timeOfWorksRepository.createQueryBuilder("time_of_worke")
        .where("time_of_worke.user_id = :userId", { userId: data.userId })
        .andWhere("time_of_worke.checked_in IS NOT NULL")
        .andWhere("time_of_worke.checked_in <= :endDate", { endDate: data.endDate })
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

    async getInfoTimeOfWork(id: number): Promise<TimeOfWorke | ApiResponse>{
        const timeOfWork = await this.timeOfWorksRepository.findOne({ where: { timeOfWorkeId: id } });

        if(!timeOfWork){
            return new ApiResponse("error", 404, "Time of work for this id is not exists");
        }

        return timeOfWork;
    }

    async updateUserTimeOfWork(data: UdateTimeOfWorkUserDto): Promise<TimeOfWorke | ApiResponse | null>{
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
