import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Between, IsNull, Repository } from 'typeorm';
import { UserCheckedInDto } from './dtos/user.checkedin.dto';
import { GetHorseDto } from './dtos/get.horse.dto';

@Injectable()
export class TimeofworkService {
    constructor(@InjectRepository(TimeOfWorke) private readonly timeOfWorksRepository: Repository<TimeOfWorke>){}

    async userCheckedIn(data: UserCheckedInDto): Promise<TimeOfWorke | ApiResponse>{
        const checkedUser = await this.timeOfWorksRepository.findOne({
            where : {
                userId: data.userId,
                checked_out: IsNull()
            }
        })

        if(checkedUser){
            return new ApiResponse("error", -4001, "Korisnik je vec prijavljen");
        }



        const timeOfWork = new TimeOfWorke();
        timeOfWork.userId = data.userId;
        timeOfWork.adminId = data.adminId;
        timeOfWork.checked_in = new Date();

        const savedTimeOfWork = await this.timeOfWorksRepository.save(timeOfWork);
        if(!savedTimeOfWork){
            return new ApiResponse("error", -4002, "Ne mogu da se prijavim");
        }


        return savedTimeOfWork;
    }    



    async userCheckedOut(data: UserCheckedInDto): Promise<TimeOfWorke | ApiResponse>{
        const checkedUser = await this.timeOfWorksRepository.findOne({
            where : {
                userId: data.userId,
                checked_out: IsNull()
            }
        })

        if(!checkedUser){
            return new ApiResponse("error", -4001, "Korisnik nije prijavljen");
        }

        checkedUser.checked_out = new Date();

        const savedTimeOfWork = await this.timeOfWorksRepository.save(checkedUser);
        if(!savedTimeOfWork){
            return new ApiResponse("error", -4002, "Ne mogu da se odjavim");
        }

        return savedTimeOfWork;
    }

    async getTiemOfWorkByUserId(data: GetHorseDto): Promise<{getOfTime: string}>{
        const timeOfWork = await this.timeOfWorksRepository.find({
            where: {
                userId: data.userId,
                checked_in: Between(new Date(data.stratDate), new Date(data.endDate))
            }
        });

        if(!timeOfWork){
            return {getOfTime: "0"}
        }

        let sumTime = 0;

        timeOfWork.forEach((element) => {
            sumTime += element.checked_out.getTime() - element.checked_in.getTime();
        });

        let totalHouerse = Number((sumTime / (1000 *60 * 60)).toFixed(2));


        let sufix = "H";


        if(totalHouerse < 1){
            sufix = "min";
            totalHouerse = Number(totalHouerse.toString().split(".")[1]);
        }


        
        return { getOfTime: totalHouerse.toString() + sufix }

    }
}
