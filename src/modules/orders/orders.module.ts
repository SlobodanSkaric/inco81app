import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Items } from 'entitets/entities/Items';
import { OrderItems } from 'entitets/entities/OrderItems';
import { Orders } from 'entitets/entities/Orders';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DataSource } from 'typeorm';

@Module({
     imports: [TypeOrmModule.forFeature([Orders,OrderItems,Items])],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService]
})
export class OrdersModule {}
