import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_COOKIE } from './common/decorators/swagger.decorator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('API81')
    .setDescription(
      'Work time management API. Authentication uses the httpOnly "access_token" cookie: ' +
      'call one of the /auth login endpoints from this page and the browser will send the cookie automatically.',
    )
    .setVersion('1.0')
    .addCookieAuth(ACCESS_TOKEN_COOKIE)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  app.enableCors({
    credentials: true,
    origin: configService.get<string>("CORSES_ORIGIN")?.split(",").map(origin => origin.trim()),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept',
  });

  const server = app.getHttpAdapter().getInstance();  
  server.set('trust proxy', Number(configService.get<number>("TRUST_PROXY_HOPS") ?? 0));
  app.enableShutdownHooks();
  await app.listen(configService.get<number>("APP_PORT") ?? 3000);
}
bootstrap();
