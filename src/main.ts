import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import  helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_COOKIE } from './common/decorators/swagger.decorator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>("NODE_ENV", "development");


  app.use(helmet());
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  }));

  if(nodeEnv !== "production"){
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
  }
  app.use(helmet.crossOriginOpenerPolicy({
    policy: 'same-origin',
  }));

  app.use(cookieParser());
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  const corsOriginRaw = configService.get<string>("CORS_ORIGIN");
  if (!corsOriginRaw && nodeEnv === "production") {
    throw new Error("CORS_ORIGIN is required in production");
  }
  const corsOrigins = corsOriginRaw
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    credentials: true,
    origin: corsOrigins && corsOrigins.length > 0
      ? corsOrigins
      : nodeEnv === "production"
        ? false
        : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept',
  });

  const server = app.getHttpAdapter().getInstance();  
  server.set('trust proxy', Number(configService.get<number>("TRUST_PROXY_HOPS") ?? 0));
  app.enableShutdownHooks();
  await app.listen(configService.get<number>("APP_PORT") ?? 3000);
}
bootstrap();
