import { Get, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Items } from 'entitets/entities/Items';
import { Repository } from 'typeorm';
import { GetItemsDto } from './dtos/get.itmes.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AddItemsDto } from './dtos/add.items.dto';

@Injectable()
export class ItemsService {
    constructor(@InjectRepository(Items) private readonly itemsRepository: Repository<Items>) {}

    async findAllItems(): Promise<GetItemsDto[] | ApiResponse> { 
        const items = await this.itemsRepository.find();

        if(items.length === 0){
            return new ApiResponse("error", -1201, "No items found");
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
            return new ApiResponse("error", -1202, "Item not found");
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

        return new GetItemsDto(
            savedItem.itemId,
            savedItem.itemName,
            savedItem.price,
            savedItem.stockQuantity
        );
    }
}
