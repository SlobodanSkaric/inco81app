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
import { RequestlogService } from './modules/requestlog/requestlog.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { FingerprintGuard } from './common/guards/fingerprints.gurds';
import { JobinformationsModule } from './modules/jobinformations/jobinformations.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RequestLogInterceptor } from './common/interceptors/request.log.interceptors';
import { LogsModule } from './logs/logs.module';
import { SuperadministratorModule } from './modules/superadministrator/superadministrator.module';
import { VacationModule } from './modules/vacation/vacation.module';


@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true
    }),
    UserModule,
    AdministratorModule,
    TimeofworkModule,
    AuthModule,
    ReportModule,
    RequestlogModule,
    JobinformationsModule,
    LogsModule,
    SuperadministratorModule,
    VacationModule
  ],

  providers:[
    RequestlogService,
    {
      provide: APP_GUARD,
      useClass: FingerprintGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLogInterceptor
    }
  ]
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FingerprintMiddleware).exclude("auth/*").forRoutes("*");//exclude
  }
}
