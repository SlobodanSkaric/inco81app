import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RequestLogs } from "entitets/entities/RequestLogs";
import { RequestLogsListeners } from "./listeners/request.logs.listeners";

@Module({
    imports: [TypeOrmModule.forFeature([RequestLogs])],
    providers: [RequestLogsListeners],
})
export class LogsModule {}

