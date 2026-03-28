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
        reqLogs.userId = payload.user_id;
        reqLogs.ip = payload.ip;
        reqLogs.userAgent = payload.user_agent;
        reqLogs.acceptLanguage = payload.accept_language;
        reqLogs.deviceFingerprint = payload.device_fingerprint;
        reqLogs.route = payload.path;
        reqLogs.ts = payload.ts;
        reqLogs.responseStatus = payload.response_status;
        reqLogs.responseTime = payload.response_time;
        reqLogs.requestMethod = payload.method;
        
        await this.requestLog.save(reqLogs);
    }
}