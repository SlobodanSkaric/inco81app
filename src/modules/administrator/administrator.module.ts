import { Module } from '@nestjs/common';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrator } from 'entitets/entities/Administrator';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { OrdersModule } from '../orders/orders.module';
import { Vacations } from 'entitets/entities/Vacations';

@Module({
  imports: [TypeOrmModule.forFeature([Administrator,TimeOfWorke,Vacations]), OrdersModule],
  controllers: [AdministratorController],
  providers: [AdministratorService],
  exports:[AdministratorService]
})
export class AdministratorModule {}
