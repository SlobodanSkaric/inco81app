import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vacations } from 'entitets/entities/Vacations';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';
import { AddVacationsDto } from './dto/add.vacations.dto';
import { dataUtils } from 'src/utils/data.utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VactionRequestCreatedEvent } from './events/vaction.events.def';

@Injectable()
export class VacationService {
    constructor(
        @InjectRepository(Vacations) private readonly vacation: Repository<Vacations>,
        private readonly eventEmitter: EventEmitter2
    ){}

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
        const newVacations = this.vacation.create({
            vacation_start: dataUtils(vacactionsData.vacation_start),
            vacation_end: dataUtils(vacactionsData.vacation_end),
            user: { userId: vacactionsData.userId },
            admin: { adminId: vacactionsData.admin },
            reason: vacactionsData.reason,
            status: vacactionsData.status,
            admin_comment: vacactionsData.admin_comment ?? null,
            user_comment: vacactionsData.user_comment ?? null
        });

        const savedVacation = await this.vacation.save(newVacations);

        if(!savedVacation){
            return new ApiResponse("error", -1003, "Cannot add vacation!");
        }

        this.eventEmitter.emit('vacation.request.created', new VactionRequestCreatedEvent(savedVacation.vacationId, vacactionsData.userId));

        return savedVacation;
    }
}
