import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'entitets/entities/Users';
import { Administrator } from 'entitets/entities/Administrator';
import { AdministratorModule } from 'src/modules/administrator/administrator.module';
import { UserModule } from 'src/modules/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwr.strategy';
import { Superadministrator } from 'entitets/entities/Superadministrator';
import { SuperadministratorModule } from 'src/modules/superadministrator/superadministrator.module';
import { JwtRefreshStrategy } from './jwt.refresh.strategy';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { AuthUserServices } from './auth.user.services';
import { CustomersModule } from '../customers/customers.module';
import { Customers } from 'entitets/entities/Customers';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, JwtService, AuthUserServices],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('SECRET_TOKEN_KEY'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    TypeOrmModule.forFeature([Users, Administrator, Superadministrator, TimeOfWorke,Customers]),
    AdministratorModule,
    UserModule,
    SuperadministratorModule,
    CustomersModule
  ]
})
export class AuthModule {}
