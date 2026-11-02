import { Module } from '@nestjs/common';
import { SuperadministratorController } from './superadministrator.controller';
import { SuperadministratorService } from './superadministrator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../redis/redis.module';
import { AdministratorModule } from '../administrator/administrator.module';
import { Users } from '../../entitets/entities/Users';

@Module({
  controllers: [SuperadministratorController],
  providers: [SuperadministratorService],
  imports: [TypeOrmModule.forFeature([Users]), RedisModule, AdministratorModule],
  exports: [SuperadministratorService]
})
export class SuperadministratorModule {}
