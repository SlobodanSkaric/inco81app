import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { Users } from 'entitets/entities/Users';
import { Administrator } from 'entitets/entities/Administrator';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([TimeOfWorke,Users,Administrator])],
  providers: [ReportService],
  controllers: [ReportController]  
})
export class ReportModule {}
