import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Items } from 'src/entitets/entities/Items';
import { DataSource, Repository } from 'typeorm';
import { GetItemsDto } from './dtos/get.itmes.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AddItemsDto } from './dtos/add.items.dto';
import { CacheIvalidationEvent } from 'src/common/events/cahce.events';
import { UpdateItemsDto } from './dtos/update.items.dto';
import { runInTransaction, txAbort } from 'src/misc/transaction.abort';
import { moneyToCents } from 'src/utils/money.utils';

@Injectable()
export class ItemsService {
    constructor(
        @InjectRepository(Items) private readonly itemsRepository: Repository<Items>,
        private readonly eventEmmiter: EventEmitter2,
        private readonly dataSource: DataSource,
    ) {}

    private invalidateItemsCache(action: "create" | "update" | "delete"): void {
        this.eventEmmiter.emit("cache.invalidate",
            new CacheIvalidationEvent(
                [],
                [
                    "administrator:*:/items/all",
                    "administrator:*:/items/*",
                    "superadministrator:*:/items/all",
                    "superadministrator:*:/items/*",
                    "customer:*:/items/all",
                    "customer:*:/items/*",
                ],
                "Items",
                action,
            )
        );
    }

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
        if (!(moneyToCents(items.price) > 0)) {
            return new ApiResponse("error", 400, "Price must be greater than zero");
        }

        const newItem = new Items();
        newItem.itemName = items.itemName;
        newItem.price = items.price;
        newItem.stockQuantity = items.stockQuantity;

        const savedItem = await this.itemsRepository.save(newItem);

        this.invalidateItemsCache("create");

        return new GetItemsDto(
            savedItem.itemId,
            savedItem.itemName,
            savedItem.price,
            savedItem.stockQuantity
        );
    }

    async updateItem(data: UpdateItemsDto): Promise<GetItemsDto | ApiResponse> {
        if (data.price === undefined && data.stockQuantity === undefined) {
            return new ApiResponse("error", 400, "Provide price and/or stockQuantity to update");
        }

        if (data.price !== undefined && !(moneyToCents(data.price) > 0)) {
            return new ApiResponse("error", 400, "Price must be greater than zero");
        }

        const result = await runInTransaction(this.dataSource, async (manager) => {
            const item = await manager.findOne(Items, {
                where: { itemId: data.itemId },
                lock: { mode: "pessimistic_write" },
            });

            if (!item) {
                txAbort("error", 404, "Item not found");
            }

            if (data.price !== undefined) {
                item.price = data.price;
            }
            if (data.stockQuantity !== undefined) {
                item.stockQuantity += data.stockQuantity;
            }

            return await manager.save(item);
        });

        if (result instanceof ApiResponse) {
            return result;
        }

        this.invalidateItemsCache("update");

        return new GetItemsDto(result.itemId, result.itemName, result.price, result.stockQuantity);
    }
}
