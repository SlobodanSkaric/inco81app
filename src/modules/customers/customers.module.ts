import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customers } from 'entitets/entities/Customers';
import { CustomersController } from './customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customers])],
  providers: [CustomersService],
  controllers: [CustomersController],
})
export class CustomersModule {}
