import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ItemsService } from './items.service';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuards } from '../auth/jwtAuthGuards';
import { GetItemsDto } from './dtos/get.itmes.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AddItemsDto } from './dtos/add.items.dto';
import { RedisService } from '../redis/redis.service';
import { LessThan } from 'typeorm';
import { CacheRedisIntrceptor } from 'src/common/interceptors/cache.redis.interceptors';

@Controller('items')
export class ItemsController {
    constructor(
        private readonly itemsService: ItemsService,
        private readonly RedisService: RedisService
    ){}

    @UseInterceptors(CacheRedisIntrceptor)
    @Get("all")
    @UseGuards(JwtAuthGuards,RoleGuards)
    @Roles("administrator", "superadministrator")
    async getAllItems(): Promise<GetItemsDto[] | ApiResponse> {
        const items =  await this.itemsService.findAllItems();
        return items;
    }

    @UseInterceptors(CacheRedisIntrceptor)
    @Get(":id")
    @UseGuards(JwtAuthGuards,RoleGuards)
    @Roles("administrator", "superadministrator")
    async getItemById(@Param("id") id: number): Promise<GetItemsDto | ApiResponse> {
        const item = await this.itemsService.getItemsById(id);
        return item;
    }

    @Post("save")
    @UseGuards(JwtAuthGuards,RoleGuards)
    @Roles("administrator", "superadministrator")
    async addItem(@Body() item: AddItemsDto): Promise<GetItemsDto | ApiResponse> {
        return await this.itemsService.addItems(item);
    }

}
