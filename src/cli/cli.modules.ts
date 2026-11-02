import { Inject, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GetDatabaseConfig } from "../config/database.config";
import { join } from "path";
import { Users } from "../entitets/entities/Users";
import { SuperadministratorService } from "../modules/superadministrator/superadministrator.service";

@Module({
    imports:[
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
               ...GetDatabaseConfig(configService),
               entities: [join(__dirname, "..", "entitets", "entities", "*.{js,ts}")],
               autoLoadEntities: false,
               retryAttempts: 2,
               retryDelay: 1000
            }),
        }),
        TypeOrmModule.forFeature([Users])
    ],
    providers:[SuperadministratorService]
})
export class CliModules {}