import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RequestLogs } from "src/entitets/entities/RequestLogs";
import { RequestLogsListeners } from "./listeners/request.logs.listeners";
import { RedisModule } from "src/modules/redis/redis.module";

@Module({
    imports: [TypeOrmModule.forFeature([RequestLogs]), RedisModule],
    providers: [RequestLogsListeners],
})
export class LogsModule {}

