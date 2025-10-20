import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AdministratorModule } from './administrator/administrator.module';
import { TimeofworkModule } from './timeofwork/timeofwork.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './middlewares/auth.middlewares';
import { ReportModule } from './report/report.module';
import { RequestlogModule } from './requestlog/requestlog.module';
import { FingerprintMiddleware } from './middlewares/fingerprint.middleware';
import { RequestlogService } from './requestlog/requestlog.service';
import { APP_GUARD } from '@nestjs/core';
import { FingerprintGuard } from './common/guards/fingerprints.gurds';
import { JobinformationsModule } from './jobinformations/jobinformations.module';


@Module({
  imports: [
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
  ],
  controllers: [],

  providers:[
    RequestlogService,
    {
      provide: APP_GUARD,
      useClass: FingerprintGuard
    }
  ]
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FingerprintMiddleware).forRoutes("*");//exclude
  }
}
