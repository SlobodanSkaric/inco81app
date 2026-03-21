import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ItemsService } from './items.service';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { Roles } from 'src/common/decorators/role.decorators';
import { JwtAuthGuards } from '../auth/jwtAuthGuards';
import { GetItemsDto } from './dtos/get.itmes.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AddItemsDto } from './dtos/add.items.dto';

@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService){}

    @Get("all")
    @UseGuards(JwtAuthGuards,RoleGuards)
    @Roles("administrator", "superadministrator")
    async getAllItems(): Promise<GetItemsDto[] | ApiResponse> {
        return await this.itemsService.findAllItems();
    }

    @Get(":id")
    @UseGuards(JwtAuthGuards,RoleGuards)
    @Roles("administrator", "superadministrator")
    async getItemById(@Param("id") id: number): Promise<GetItemsDto | ApiResponse> {
        return await this.itemsService.getItemsById(id);
    }

    @Post("save")
    @UseGuards(JwtAuthGuards,RoleGuards)
    @Roles("administrator", "superadministrator")
    async addItem(@Body() item: AddItemsDto): Promise<GetItemsDto | ApiResponse> {
        return await this.itemsService.addItems(item);
    }

}
