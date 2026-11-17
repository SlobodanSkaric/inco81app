import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Items } from 'src/entitets/entities/Items';
import { Repository } from 'typeorm';
import { GetItemsDto } from './dtos/get.itmes.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AddItemsDto } from './dtos/add.items.dto';
import { CacheIvalidationEvent } from 'src/common/events/cahce.events';

@Injectable()
export class ItemsService {
    constructor(
        @InjectRepository(Items) private readonly itemsRepository: Repository<Items>,
        private readonly eventEmmiter: EventEmitter2,
    ) {}

    async findAllItems(): Promise<GetItemsDto[] | ApiResponse> { 
        const items = await this.itemsRepository.find();

        if(items.length === 0){
            return new ApiResponse("error", 404, "No items found");
        }

        return items.map(item => new GetItemsDto(
            item.itemId,
            item.itemName,
            item.price,
            item.stockQuantity
        ));
    }


    async getItemsById(id: number): Promise<GetItemsDto | ApiResponse> {
        const item = await this.itemsRepository.findOne({ where: { itemId: id } });

        if(!item){
            return new ApiResponse("error", 404, "Item not found");
        }

        return new GetItemsDto(
            item.itemId,
            item.itemName,
            item.price,
            item.stockQuantity
        );
    }

    async addItems(items: AddItemsDto): Promise<GetItemsDto | ApiResponse> {
        const newItem = new Items();
        newItem.itemName = items.itemName;
        newItem.price = items.price;
        newItem.stockQuantity = items.stockQuantity;

        const savedItem = await this.itemsRepository.save(newItem);

        this.eventEmmiter.emit("cache.invalidate",
            new CacheIvalidationEvent(
                [],
                [
                    "administrator:*:/items/all",
                    "administrator:*:/items/*",
                    "superadministrator:*:/items/all",
                    "superadministrator:*:/items/*",
                ],
                "Items",
                "create",
            )
        );

        return new GetItemsDto(
            savedItem.itemId,
            savedItem.itemName,
            savedItem.price,
            savedItem.stockQuantity
        );
    }
}
