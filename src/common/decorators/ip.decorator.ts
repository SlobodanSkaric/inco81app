import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetIp = createParamDecorator((data: unknown, ctx:ExecutionContext) =>{
    const request = ctx.switchToHttp().getRequest();

    
    return request.ip ?? request.socket.remoteAddress ?? "unknown";
});

/* export const GetUa = createParamDecorator((data: unknown, ctx:ExecutionContext) =>{
    const request = ctx.switchToHttp().getRequest();
    return request.headers["user-agent"] ?? "unknown";
});

export const GetIpUa = createParamDecorator((data: unknown, ctx:ExecutionContext) =>{
    const request = ctx.switchToHttp().getRequest();
    return {
        ip: request.ip ?? request.socket.remoteAddress ?? "unknown",
        ua: request.headers["user-agent"] ?? "unknown"
    };
}); */