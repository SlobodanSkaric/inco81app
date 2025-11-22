import { Module } from '@nestjs/common';
import { JobinformationsController } from './jobinformations.controller';
import { JobinformationsService } from './jobinformations.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobInformations } from 'entitets/entities/JobInformations';

@Module({
  controllers: [JobinformationsController],
  providers: [JobinformationsService],
  imports: [TypeOrmModule.forFeature([JobInformations])],
})
export class JobinformationsModule {}
