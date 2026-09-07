import { Module } from '@nestjs/common';
import { SuperadministratorController } from './superadministrator.controller';
import { SuperadministratorService } from './superadministrator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Superadministrator } from 'src/entitets/entities/Superadministrator';
import { RedisModule } from '../redis/redis.module';

@Module({
  controllers: [SuperadministratorController],
  providers: [SuperadministratorService],
  imports: [TypeOrmModule.forFeature([Superadministrator]), RedisModule],
  exports: [SuperadministratorService]
})
export class SuperadministratorModule {}
