import { Module } from '@nestjs/common';
import { TimeofworkController } from './timeofwork.controller';
import { TimeofworkService } from './timeofwork.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';

@Module({
  imports: [TypeOrmModule.forFeature([TimeOfWorke])],
  controllers: [TimeofworkController],
  providers: [TimeofworkService],
})
export class TimeofworkModule {}
