import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vacations } from 'entitets/entities/Vacations';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';
import { AddVacationsDto } from './dtos/add.vacations.dto';
import { dataUtils } from 'src/utils/data.utils';

@Injectable()
export class VacationService {
    constructor(@InjectRepository(Vacations) private readonly vacation: Repository<Vacations>){}

    async findAll(): Promise<Vacations[] | ApiResponse> {
        const alllVacations = await this.vacation.find();

        if(alllVacations.length === 0){
            return new ApiResponse("error", -1001, "No vacations found!");
        }

        return alllVacations;
    }

    async findById(id: number): Promise<Vacations | ApiResponse>{
        const vacations = await this.vacation.findOne({ where: {vacationId : id}})

        if(!vacations){
            return new ApiResponse("error", -1002, "Vacation not found!");
        }

        return vacations;
    }

    async addVactions(vacactionsData: AddVacationsDto): Promise<Vacations | ApiResponse>{
        const newVacations = new Vacations();
        newVacations.vacation_start = dataUtils(vacactionsData.vacation_start);
        newVacations.vacation_end = dataUtils(vacactionsData.vacation_end);
        newVacations.userId = vacactionsData.userId;
        newVacations.adminId = vacactionsData.adminId;
        newVacations.reason = vacactionsData.reason;
        newVacations.status = vacactionsData.status;
        newVacations.admin_comment = vacactionsData.admin_comment ?? null;
        newVacations.user_comment = vacactionsData.user_comment ?? null;

        const savedVacation = await this.vacation.save(newVacations);

        if(!savedVacation){
            return new ApiResponse("error", -1003, "Cannot add vacation!");
        }

        return savedVacation;
    }
}
