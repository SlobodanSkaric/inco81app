import { Module } from '@nestjs/common';
import { VacationService } from './vacation.service';
import { Vacations } from 'entitets/entities/Vacations';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacationController } from './vacation.controller';
import { EmailModule } from '../email/email.module';
import { VactionNotificationListener } from './events/vactions.notification.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Vacations]), EmailModule],
  providers: [VacationService, VactionNotificationListener],
  controllers: [VacationController],
})
export class VacationModule {}
