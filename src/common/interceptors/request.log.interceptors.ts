import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { catchError, Observable, tap } from "rxjs";

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
            user_id: request.userIdreq || null,
            fingerprint: request.fingerprint || request.headers["x-fingerprint"] || null,
            coleration_id: request.headers["x-request-id"] || null,
            ip: ((request.ip || request.headers["x-forwarded-for"] || request.socket.remoteAddress || "").toString().split(",")[0].trim()) as string,
            user_agent: (request.headers["user-agent"] as string) || null,
            ts: new Date(),
        }

        return next.handle().pipe(
            tap(() => {
                const duration = Number((process.hrtime.bigint() - start) / 1000000n) //ms
                this.emiter.emit("request.log", {
                    ...basePayload,
                    response_status: reponse.statusCode,
                    response_time: duration
                });
            }),
            catchError((err) => {
                const duration = Number((process.hrtime.bigint() - start) / 1000000n) //ms
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