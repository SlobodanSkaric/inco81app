import { Module } from '@nestjs/common';
import { RequestlogService } from './requestlog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLogs } from 'entitets/entities/RequestLogs';

@Module({
  providers: [RequestlogService],
  imports: [TypeOrmModule.forFeature([RequestLogs])],
})
export class RequestlogModule {}
