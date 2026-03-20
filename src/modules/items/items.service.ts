import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Items } from 'entitets/entities/Items';
import { Repository } from 'typeorm';

@Injectable()
export class ItemsService {
    constructor(@InjectRepository(Items) private readonly itemsRepository: Repository<Items>) {}

    async findAllItems(): Promise<Items[] | null> { return null}
}
