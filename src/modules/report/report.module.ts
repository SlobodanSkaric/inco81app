import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { Users } from 'src/entitets/entities/Users';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports:[TypeOrmModule.forFeature([TimeOfWorke,Users]), ConfigModule.forRoot()],
  providers: [ReportService],
  controllers: [ReportController]  
})
export class ReportModule {}
