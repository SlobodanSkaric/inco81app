import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { RequestLogs } from "src/entitets/entities/RequestLogs";
import { Users } from "src/entitets/entities/Users";
import { Repository } from "typeorm";
import { Role } from "../../common/enums/role.enum";

@Injectable()
export class RequestLogsListeners {
    private readonly logger = new Logger(RequestLogsListeners.name);

    constructor(
        @InjectRepository(RequestLogs) private readonly requestLog: Repository<RequestLogs>,
    ) {}

    @OnEvent("request.log", {async: true})
    async handle(payload: any){
        try {
            const reqLogs = new RequestLogs();
            reqLogs.role = payload.role;
            this.assignActor(payload, reqLogs);
            reqLogs.ip = payload.ip;
            reqLogs.userAgent = payload.user_agent;
            reqLogs.acceptLanguage = payload.accept_language;
            // mysql driver escapes plain objects as `key`='val' pairs → ER_BAD_FIELD_ERROR (e.g. userAgent)
            const fingerprint = payload.user_host_info ?? payload.fingerprint;
            reqLogs.deviceFingerprint = fingerprint == null ? null : typeof fingerprint === "string" ? fingerprint : JSON.stringify(fingerprint);
            reqLogs.route = payload.path;
            reqLogs.ts = payload.ts;
            reqLogs.responseStatus = payload.response_status;
            reqLogs.responseTime = payload.response_time;
            reqLogs.requestMethod = payload.method;

            await this.requestLog.save(reqLogs);
        } catch (error) {
            this.logger.error(`Failed to persist request log: ${error instanceof Error ? error.message : error}`);
        }
    }

    private assignActor(payload: any, reqLogs: RequestLogs){
        const role = payload.role;
        const hasUserRow = role === Role.USER || role === Role.ADMIN || role === Role.SUPER_ADMIN;
        if(hasUserRow && payload.user_id != null){
            reqLogs.user = { userId: Number(payload.user_id) } as Users;
        } else {
            reqLogs.user = null;
        }
    }
}
