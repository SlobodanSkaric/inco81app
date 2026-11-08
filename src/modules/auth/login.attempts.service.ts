import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class LoginAttemptsService {
    private readonly maxAttempts = 5;
    private readonly lockSeconds = 15 * 60;

    constructor(
        private readonly redisService: RedisService
    ){}

    private key(email: string): string {
        return `login:fail:${email.trim().toLowerCase()}`;
    }

    async assetorsNotLocked(email: string): Promise<void> {
        const attempts = Number(await this.redisService.get<number>(this.key(email)));
        if(attempts >= this.maxAttempts) {
            throw new HttpException("Too many login attempts. Try again later", HttpStatus.TOO_MANY_REQUESTS);
        }
    }



    async registerFailer(email: string): Promise<void> {
        await this.redisService.increment(this.key(email), this.lockSeconds);
    }

    async resetFailures(email: string): Promise<void> {
        await this.redisService.delete(this.key(email));
    }
    
}