import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const GetDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions  => {
    const nodeEnv = configService.get<string>('NODE_ENV', "development");

    return {
        type: "mysql",
        host: configService.get<string>("DATABASE_HOST"),
        port: configService.get<number>("DATABASE_PORT"),
        username: configService.get<string>("DATABASE_USERNAME"),
        password: configService.get<string>("DATABASE_PASSWORD"),
        database: configService.get<string>("DATABASE_NAME"),


        entities: [__dirname + "/../entitets/entities/*.{ts,js}"],
        migrations: [__dirname + "/../migrations/*.{ts,js}"],


        autoLoadEntities: true,
        synchronize: false, 
        logging: nodeEnv === "development" ? true : false,

        extra: nodeEnv === "production" ? {
            max: 10,
            min: 2,
            waitForConnections: true,
            acquireTimeout: 10000,
        }:{}
    }   
    
};