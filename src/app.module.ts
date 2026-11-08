import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AdministratorModule } from './modules/administrator/administrator.module';
import { TimeofworkModule } from './modules/timeofwork/timeofwork.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReportModule } from './modules/report/report.module';
import { RequestlogModule } from './modules/requestlog/requestlog.module';
import { FingerprintMiddleware } from './middlewares/fingerprint.middleware';
import { JobinformationsModule } from './modules/jobinformations/jobinformations.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LogsModule } from './logs/logs.module';
import { SuperadministratorModule } from './modules/superadministrator/superadministrator.module';
import { VacationModule } from './modules/vacation/vacation.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ItemsModule } from './modules/items/items.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { EmailModule } from './modules/email/email.module';
import { existsSync } from 'fs';
import { join } from 'path';
import { GetDatabaseConfig } from './config/database.config';
import { PaymentsModule } from './modules/payments/payments.module';
import { RedisModule } from './modules/redis/redis.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLogInterceptor } from './common/interceptors/request.log.interceptors';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

const templatesDir = existsSync(join(process.cwd(), 'dist/templates'))
  ? join(process.cwd(), 'dist/templates')
  : join(process.cwd(), 'src/templates');
const mailPort = Number(process.env.MAIL_PORT);
const mailSecure = process.env.MAIL_SECURE
  ? process.env.MAIL_SECURE === 'true'
  : mailPort === 465;

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: 60000,
          limit: Number(configService.get<number>("THROTTLE_LIMIT")  ?? 100),
       },
      ]
    }),
    EventEmitterModule.forRoot(),
    MailerModule.forRoot({
      transport:{
        host: process.env.MAIL_HOST,
        port: mailPort,
        secure: mailSecure,
        auth:{
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
        }
      },
      template: {
        dir: templatesDir,
        adapter: new HandlebarsAdapter(),
        options: {strict: true}
      }
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => 
        GetDatabaseConfig(configService)
    }),
    UserModule,
    AdministratorModule,
    TimeofworkModule,
    AuthModule,
    ReportModule,
    //RequestlogModule,
    JobinformationsModule,
    LogsModule,
    SuperadministratorModule,
    VacationModule,
    CustomersModule,
    OrdersModule,
    ItemsModule,
    EmailModule,
    PaymentsModule,
    RedisModule
  ],

 providers:[
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLogInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ]

})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FingerprintMiddleware).exclude("auth/*path").forRoutes("*");//exclude
  }
}
