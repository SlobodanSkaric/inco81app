import { Module } from '@nestjs/common';
import { SuperadministratorController } from './superadministrator.controller';
import { SuperadministratorService } from './superadministrator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Superadministrator } from 'entitets/entities/Superadministrator';

@Module({
  controllers: [SuperadministratorController],
  providers: [SuperadministratorService],
  imports: [TypeOrmModule.forFeature([Superadministrator])],
  exports: [SuperadministratorService]
})
export class SuperadministratorModule {}
