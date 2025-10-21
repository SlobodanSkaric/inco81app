import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { RequestLogs } from "entitets/entities/RequestLogs";
import { Repository } from "typeorm";

@Injectable()
export class RequestLogsListeners {
    constructor(@InjectRepository(RequestLogs) private readonly requestLog: Repository<RequestLogs>) {}

    @OnEvent("request.log", {async: true})
    async handle(payload: any){
        const reqLogs = new RequestLogs();
        reqLogs.userId = payload.user_id.id;
        reqLogs.ip = payload.ip;
        reqLogs.userAgent = payload.user_agent;
        reqLogs.ts = payload.ts;
        console.log("Logging request:", payload);
        await this.requestLog.save(reqLogs);
    }
}