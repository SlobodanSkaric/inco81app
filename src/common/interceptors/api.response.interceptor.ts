import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { ApiResponse } from "src/misc/api.response.dto";
import { Response } from "express";

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const  res = context.switchToHttp().getResponse<Response>();

        return next.handle().pipe(
            map((data) => {
                if(data instanceof ApiResponse && data.status === "error"){
                    res.status(data.code ?? 400);
                }
                return data;
            })
        );
    }
}