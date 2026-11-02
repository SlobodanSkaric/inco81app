import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ItemsService } from './items.service';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuards } from '../auth/jwtAuthGuards';
import { GetItemsDto } from './dtos/get.itmes.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AddItemsDto } from './dtos/add.items.dto';
import { RedisService } from '../redis/redis.service';
import { CacheRedisIntrceptor } from 'src/common/interceptors/cache.redis.interceptors';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';

@ApiTags('items')
@ApiAuth("administrator", "superadministrator")
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
    @UseGuards(JwtAuthGuards,RoleGuards)
    @Roles("administrator", "superadministrator")
    async getAllItems(): Promise<GetItemsDto[] | ApiResponse> {
        const items =  await this.itemsService.findAllItems();
        return items;
    }

    @ApiOperation({ summary: 'Get item by id' })
    @ApiResult(GetItemsDto)
    @UseInterceptors(CacheRedisIntrceptor)
    @Get(":id")
    @UseGuards(JwtAuthGuards,RoleGuards)
    @Roles("administrator", "superadministrator")
    async getItemById(@Param("id") id: number): Promise<GetItemsDto | ApiResponse> {
        const item = await this.itemsService.getItemsById(id);
        return item;
    }

    @ApiOperation({ summary: 'Create item' })
    @ApiResult(GetItemsDto, { status: 201 })
    @Post("save")
    @UseGuards(JwtAuthGuards,RoleGuards)
    @Roles("administrator", "superadministrator")
    async addItem(@Body() item: AddItemsDto): Promise<GetItemsDto | ApiResponse> {
        return await this.itemsService.addItems(item);
    }

}
