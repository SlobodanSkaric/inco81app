import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vacations } from 'src/entitets/entities/Vacations';
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
            return new ApiResponse("error", 404, "No vacations found!");
        }

        return alllVacations;
    }

    async findById(id: number, userId: number): Promise<Vacations | ApiResponse>{
        const vacations = await this.vacation.findOne({ where: {vacationId : id, user: {userId}}})

        if(!vacations){
            return new ApiResponse("error", 404, "Vacation not found!");
        }

        return vacations;
    }

    async addVactions(vacactionsData: AddVacationsDto, userId: number): Promise<Vacations | ApiResponse>{
        //Checked user belongs to admin or superadmin and send message 
        let savedVacation: Vacations;
        try{
            const newVacations = this.vacation.create({
                vacation_start: dataUtils(vacactionsData.vacation_start),
                vacation_end: dataUtils(vacactionsData.vacation_end),
                user: {userId},
                reason: vacactionsData.reason,
                user_comment: vacactionsData.user_comment ?? null
            });
    
             savedVacation = await this.vacation.save(newVacations);
        }catch(error){
            return new ApiResponse("error", 500, "Cannot add vacation!");
        }
        

        //Send message to administrator and user
        this.eventEmitter.emit('vacation.request.created', new VactionRequestCreatedEvent(savedVacation.vacationId, userId));

        return savedVacation;
    }
}
