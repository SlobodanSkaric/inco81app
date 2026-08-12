import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { RequestLogs } from "src/entitets/entities/RequestLogs";
import { RedisService } from "src/modules/redis/redis.service";
import { Repository } from "typeorm";

@Injectable()
export class RequestLogsListeners {
    constructor(
        @InjectRepository(RequestLogs) private readonly requestLog: Repository<RequestLogs>,
        private readonly redisService: RedisService
    ) {}

    @OnEvent("request.log", {async: true})
    async handle(payload: any){
        const reqLogs = new RequestLogs();
        await this.saveActorsRequestLog(payload, reqLogs);
        reqLogs.ip = payload.ip;
        reqLogs.userAgent = payload.user_agent;
        reqLogs.acceptLanguage = payload.accept_language;
        reqLogs.deviceFingerprint = payload.fingerprint;
        reqLogs.route = payload.path;
        reqLogs.ts = payload.ts;
        reqLogs.responseStatus = payload.response_status;
        reqLogs.responseTime = payload.response_time;
        reqLogs.requestMethod = payload.method;
        //console.log("Request log payload: " + JSON.stringify(payload));
        const redisPayload = {
            user_id: payload.user_id,
            role: payload.role,
            ip: payload.ip,
            user_host_info: payload.user_host_info || null,
            route: payload.path,
            ts: payload.ts,
            response_status: payload.response_status,
            response_time: payload.response_time
        }

        await this.redisService.setCache(payload.user_id, redisPayload, {ttl: 3600}); 
        
        await this.requestLog.save(reqLogs);        
    }

    private async saveActorsRequestLog(payload: any, reqLogs: RequestLogs){
            const role = payload.role;

            switch(role){
                case "user":
                    reqLogs.userId = payload.user_id;
                    break;
                case "administrator":
                    reqLogs.adminId = payload.user_id;
                    break;
                case "superadministrator":
                    reqLogs.superadminId = payload.user_id;
                    break;
            }
    }
}