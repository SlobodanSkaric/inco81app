import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetIp = createParamDecorator((data: unknown, ctx:ExecutionContext) =>{
    const request = ctx.switchToHttp().getRequest();

    if(request.ip){
        return request.ip;
    }

    const xForwardedFor = request.headers["x-forwarded-for"];

    if(typeof xForwardedFor === "string"){
        return xForwardedFor.split(",")[0].trim();
    }

    return request.socket.remoteAddress;
});