import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

export type LoginScope = "users" | "customers";

@Injectable()
export class LoginAttemptsService {
    private readonly logger = new Logger(LoginAttemptsService.name);

    private readonly pairMaxAttempts = 5;
    private readonly pairLockSeconds = 15 * 60;

    private readonly ipMaxAttempts = 50;
    private readonly ipLockSeconds = 60 * 60;

    private readonly emailMaxAttempts = 100;
    private readonly emailLockSeconds = 60 * 60;
    private readonly emailSlowdownMs = 1500;

    constructor(
        private readonly redisService: RedisService
    ){}

    private normalizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }

    private keyPair(scope: LoginScope, email: string, ip: string): string {
        return `login:fail:pair:${scope}:${this.normalizeEmail(email)}:${ip}`;
    }

    private keyIp(ip: string): string {
        return `login:fail:ip:${ip}`;
    }

    private keyEmail(email: string): string {
        return `login:fail:email:${this.normalizeEmail(email)}`;
    }

    private key(scope: LoginScope, email: string): string {
        return `login:fail:${scope}:${this.normalizeEmail(email)}`;
    }

    private async count(key: string): Promise<number> {
        const count = Number(await this.redisService.get<number>(key));
        return isNaN(count) ? 0 : count;
    }

    

    async assetorsNotLocked(scope: LoginScope, email: string, ip: string): Promise<void> {
       const [pairAttempts, ipAttempts, emailAttempts] = await Promise.all([
        this.count(this.keyPair(scope, email, ip)),
        this.count(this.keyIp(ip)),
        this.count(this.keyEmail(email))
       ])

       if(pairAttempts >= this.pairMaxAttempts) {
        throw new HttpException("Too many login attempts. Try again later", HttpStatus.TOO_MANY_REQUESTS);
       }

       if(ipAttempts >= this.ipMaxAttempts) {
        throw new HttpException("Too many login attempts. Try again later", HttpStatus.TOO_MANY_REQUESTS);
       }

       if(emailAttempts >= this.emailMaxAttempts) {
        this.logger.warn(`Many failed logins for ${scope}:${this.normalizeEmail(email)} (${emailAttempts} in the last hour)`);
        await new Promise(resolve => setTimeout(resolve, this.emailSlowdownMs));
       }
    }



    async registerFailer(scope: LoginScope, email: string, ip: string): Promise<void> {
        await Promise.all([
            this.redisService.increment(this.keyPair(scope, email, ip), this.pairLockSeconds),
            this.redisService.increment(this.keyIp(ip), this.ipLockSeconds),
            this.redisService.increment(this.keyEmail(email), this.emailLockSeconds)
        ]);
    }

    async resetFailures(scope: LoginScope, email: string, ip: string): Promise<void> {
        await this.redisService.delete(this.keyPair(scope, email, ip));
    }
    
}