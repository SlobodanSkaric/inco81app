import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'entitets/entities/Users';
import { Administrator } from 'entitets/entities/Administrator';
import { AdministratorService } from 'src/administrator/administrator.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AdministratorService,UserService],
  imports:[TypeOrmModule.forFeature([Users,Administrator])]
})
export class AuthModule {}
