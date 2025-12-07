import { Module } from '@nestjs/common';
import { RequestlogService } from './requestlog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLogs } from 'entitets/entities/RequestLogs';
import { RequestLogInterceptor } from 'src/common/interceptors/request.log.interceptors';

@Module({
  providers: [RequestlogService],
  imports: [TypeOrmModule.forFeature([RequestLogs]), ],
  exports: [RequestlogService, TypeOrmModule],
})
export class RequestlogModule {}
