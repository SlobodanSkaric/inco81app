import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'entitets/entities/Users';
import { Administrator } from 'entitets/entities/Administrator';
import { AdministratorService } from 'src/administrator/administrator.service';
import { UserService } from 'src/user/user.service';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { AdministratorModule } from 'src/administrator/administrator.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports:[TypeOrmModule.forFeature([Users,Administrator,]), AdministratorModule, UserModule]
})
export class AuthModule {}
