import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { catchError, Observable, tap } from "rxjs";
import { ApiResponse } from "src/misc/api.response.dto";

@Injectable()
export class RequestLogInterceptor implements NestInterceptor{
    constructor(private readonly emiter: EventEmitter2){}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const http = context.switchToHttp();
        const request = http.getRequest();
        const reponse = http.getResponse();

        const path: string = request.originalUrl || request.url || "";

        const start = process.hrtime.bigint();
        
        const basePayload = {
            method: request.method,
            path: path,
            role: request.user?.role || null, 
            user_id: request.user ? request.user.id : null,
            fingerprint: request.fingerprint || null,
            coleration_id: request.headers["x-request-id"] || null,
            ip: ((request.ip || request.headers["x-forwarded-for"] || request.socket.remoteAddress || "").toString().split(",")[0].trim()) as string,
            user_agent: request.headers["user-agent"] || null,
            user_host_info: request.fingerprint?.deviceFingerprint || null,
            accept_language: (request.headers["accept-language"] as string) || null,            
            ts: new Date(),
        }

        return next.handle().pipe(
            tap((data) => {
                const duration = Number((process.hrtime.bigint() - start) / 1000000n);
                const isApiError = data instanceof ApiResponse && data.status === "error";
                this.emiter.emit("request.log", {
                    ...basePayload,
                    response_status: isApiError ? (data.code ?? reponse.statusCode) : reponse.statusCode,
                    response_time: duration,
                    ...(isApiError ? { error_message: data.messages } : {}),
                });
            }),
            catchError((err) => {
                const duration = Number((process.hrtime.bigint() - start) / 1000000n);
                this.emiter.emit("request.log", {
                    ...basePayload,
                    response_status: err.status || 500,
                    response_time: duration,
                    error_message: err.message || "Internal Server Error"
                });
                throw err;
            }
        ));

    }
}