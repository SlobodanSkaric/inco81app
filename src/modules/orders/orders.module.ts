import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Items } from 'src/entitets/entities/Items';
import { OrderItems } from 'src/entitets/entities/OrderItems';
import { Orders } from 'src/entitets/entities/Orders';
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
