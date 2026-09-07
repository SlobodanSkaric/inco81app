import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Items } from 'src/entitets/entities/Items';
import { OrderItems } from 'src/entitets/entities/OrderItems';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports:[TypeOrmModule.forFeature([Items, OrderItems]), RedisModule],
    providers: [ItemsService],
    exports: [ItemsService],
    controllers: [ItemsController]
})
export class ItemsModule {}
