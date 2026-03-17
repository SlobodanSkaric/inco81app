import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Items } from 'entitets/entities/Items';
import { OrderItems } from 'entitets/entities/OrderItems';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';

@Module({
    imports:[TypeOrmModule.forFeature([Items, OrderItems])],
    providers: [ItemsService],
    exports: [ItemsService],
    controllers: [ItemsController]
})
export class ItemsModule {}
