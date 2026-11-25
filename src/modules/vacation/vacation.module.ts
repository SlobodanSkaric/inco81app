import { Module } from '@nestjs/common';
import { VacationService } from './vacation.service';
import { Vacations } from 'src/entitets/entities/Vacations';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacationController } from './vacation.controller';
import { EmailModule } from '../email/email.module';
import { VactionNotificationListener } from './events/vactions.notification.listener';
import { Users } from 'src/entitets/entities/Users';

@Module({
  imports: [TypeOrmModule.forFeature([Vacations, Users]), EmailModule],
  providers: [VacationService, VactionNotificationListener],
  controllers: [VacationController],
  exports: [VacationService],
})
export class VacationModule {}
