import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../redis.service";
import { OnEvent } from "@nestjs/event-emitter";
import { CacheIvalidationEvent } from "src/common/events/cahce.events";

@Injectable()
export class CacheInvalidateService{
    private readonly logger = new Logger(CacheInvalidateService.name);

    constructor(
        private readonly redisServices: RedisService,
    ){}

    @OnEvent("cache.invalidate", {async: true})
    async handleCacheInvalidateEvent(event: CacheIvalidationEvent){
        this.logger.log(`Invalidate cache data: ${event.keys.join(", ")} and ${event.entity} and ${event.actions} and prefix is ${event.patterns}`);

        try{
            for(const key of event.keys){
                await this.redisServices.delete(key, {prefix: "set:cache:interceptor:"});
                this.logger.log(`Cache data invalidated for key: ${key}`);
            }

            for(const pattern of event.patterns){
                await this.redisServices.clearCacheByPattern(pattern ,{ prefix: "set:cache:interceptor:"});
               
                this.logger.log(`Cache data invalidated for pattern: ${pattern}`);
            }
        }catch(error){
            this.logger.error(`Error invalidating cache data: ${error}`);
        }
    }
}