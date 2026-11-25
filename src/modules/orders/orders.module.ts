import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Items } from 'src/entitets/entities/Items';
import { OrderItems } from 'src/entitets/entities/OrderItems';
import { Orders } from 'src/entitets/entities/Orders';
import { Payments } from 'src/entitets/entities/Payments';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersCleanupService } from './orders.cleanup.service';

@Module({
     imports: [TypeOrmModule.forFeature([Orders, OrderItems, Items, Payments])],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersCleanupService],
    exports: [OrdersService]
})
export class OrdersModule {}

