import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payments } from 'src/entitets/entities/Payments';
import { Orders } from 'src/entitets/entities/Orders';
import { OrderItems } from 'src/entitets/entities/OrderItems';

@Module({
  imports: [TypeOrmModule.forFeature([Payments, Orders, OrderItems])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
