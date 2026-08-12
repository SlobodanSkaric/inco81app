import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RedisService } from "src/modules/redis/redis.service";

@Injectable()
export class RedisRiskGuards implements CanActivate{
    constructor(private redisService: RedisService){}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const request = context.switchToHttp().getRequest();
        const userId = request.user.id

        if(!userId){
            return false;
        }

        const payload = {
            ip: request.ip || request.header["x-forwarded-from"],
            ua: request.headers["user-agent"]
        }

        const setRedisData = await this.redisService.setCache(userId, payload);

        if(!setRedisData){
            return false;
        }
                return true

    }
}