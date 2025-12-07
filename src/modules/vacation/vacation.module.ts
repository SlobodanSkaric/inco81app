import { Module } from '@nestjs/common';
import { VacationService } from './vacation.service';
import { Vacations } from 'entitets/entities/Vacations';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacationController } from './vacation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vacations])],
  providers: [VacationService],
  controllers: [VacationController],
})
export class VacationModule {}
