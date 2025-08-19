import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Repository } from 'typeorm';

@Injectable()
export class TimeofworkService {
    constructor(@InjectRepository(TimeOfWorke) private readonly timeOfWorkRepository: Repository<TimeOfWorke>){}

    async addCurentTimeOfWork(idAdmin: number, role: string, idUser: number): Promise<TimeOfWorke | ApiResponse | Boolean> {


        return false;
    }
}
