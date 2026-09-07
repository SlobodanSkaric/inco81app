import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, of, tap } from "rxjs";
import { RedisService } from "src/modules/redis/redis.service";


@Injectable()   
export class CacheRedisIntrceptor implements NestInterceptor{
    constructor(private readonly redisService: RedisService){}

  
    async intercept(context: ExecutionContext, next: CallHandler):Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        if(request.method !== "GET"){
            return next.handle();
        }

        const redisKey = `interceptor:${request.originalUrl || request.url}`;

        try{
            const redisData = await this.redisService.get(redisKey, {ttl: 60 * 60 * 24, prefix: "set:cache:"});
            if(redisData){
                return of(redisData);
            }
        }catch(err){
            console.error(`Error retrieving data from Redis: ${err}`);
        }

        return next.handle().pipe(
            tap(async (responseData) =>{
                if(responseData){
                    try{
                        await this.redisService.setCache(redisKey,responseData, {ttl: 60 * 60 * 24});
                    }
                    catch(err){
                        console.error(`Error storing data in Redis: ${err}`);
                    }
                }
            })
        )
    }
}