import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entitets/entities/Users';
import { Administrator } from 'src/entitets/entities/Administrator';
import { RedisModule } from '../redis/redis.module';
import { AdministratorModule } from '../administrator/administrator.module';

@Module({
  imports: [TypeOrmModule.forFeature([Users,Administrator]), RedisModule, AdministratorModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
