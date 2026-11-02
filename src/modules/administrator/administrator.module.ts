import { Module } from '@nestjs/common';
import { AdministratorController } from './administrator.controller';
import { AdministratorService } from './administrator.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { OrdersModule } from '../orders/orders.module';
import { Vacations } from 'src/entitets/entities/Vacations';
import { RedisModule } from '../redis/redis.module';
import { UserModule } from '../user/user.module';
import { Users } from '../../entitets/entities/Users';

@Module({
  imports: [TypeOrmModule.forFeature([Users,TimeOfWorke,Vacations]), OrdersModule, RedisModule],
  controllers: [AdministratorController],
  providers: [AdministratorService],
  exports:[AdministratorService]
})
export class AdministratorModule {}
