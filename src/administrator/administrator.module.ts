import { Module } from '@nestjs/common';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrator } from 'entitets/entities/Administrator';

@Module({
  imports: [TypeOrmModule.forFeature([Administrator])],
  controllers: [AdministratorController],
  providers: [AdministratorService],
  exports:[AdministratorService]
})
export class AdministratorModule {}
