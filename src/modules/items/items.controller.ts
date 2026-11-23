import { Body, Controller, Get, Param, ParseIntPipe, Post, UseInterceptors } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { GetItemsDto } from './dtos/get.itmes.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AddItemsDto } from './dtos/add.items.dto';
import { UpdateItemsDto } from './dtos/update.items.dto';
import { RedisService } from '../redis/redis.service';
import { CacheRedisIntrceptor } from 'src/common/interceptors/cache.redis.interceptor';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';

@ApiTags('items')
@ApiAuth("administrator", "superadministrator", "customer")
@Controller('items')
export class ItemsController {
    constructor(
        private readonly itemsService: ItemsService,
        private readonly RedisService: RedisService
    ){}

    @ApiOperation({ summary: 'Get all items' })
    @ApiResult(GetItemsDto, { isArray: true })
    @UseInterceptors(CacheRedisIntrceptor)
    @Get("all")
    @Roles("administrator", "superadministrator", "customer")
    async getAllItems(): Promise<GetItemsDto[] | ApiResponse> {
        const items =  await this.itemsService.findAllItems();
        return items;
    }

    @ApiOperation({ summary: 'Get item by id' })
    @ApiResult(GetItemsDto)
    @UseInterceptors(CacheRedisIntrceptor)
    @Get(":id")
    @Roles("administrator", "superadministrator", "customer")
    async getItemById(@Param("id", ParseIntPipe) id: number): Promise<GetItemsDto | ApiResponse> {
        const item = await this.itemsService.getItemsById(id);
        return item;
    }

    @ApiOperation({ summary: 'Create item' })
    @ApiResult(GetItemsDto, { status: 201 })
    @Post("save")
    @Roles("administrator", "superadministrator")
    async addItem(@Body() item: AddItemsDto): Promise<GetItemsDto | ApiResponse> {
        return await this.itemsService.addItems(item);
    }

    @ApiOperation({ summary: 'Update item price and/or stock' })
    @ApiResult(GetItemsDto, { status: 201 })
    @Post("update")
    @Roles("administrator", "superadministrator")
    async updateItem(@Body() item: UpdateItemsDto): Promise<GetItemsDto | ApiResponse> {
        return await this.itemsService.updateItem(item);
    }

}
