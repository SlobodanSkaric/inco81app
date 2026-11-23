import { Module } from '@nestjs/common';
import { JobinformationsController } from './jobinformations.controller';
import { JobinformationsService } from './jobinformations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobInformations } from 'src/entitets/entities/JobInformations';
import { Users } from 'src/entitets/entities/Users';

@Module({
  controllers: [JobinformationsController],
  providers: [JobinformationsService],
  imports: [TypeOrmModule.forFeature([JobInformations, Users])],
})
export class JobinformationsModule {}

