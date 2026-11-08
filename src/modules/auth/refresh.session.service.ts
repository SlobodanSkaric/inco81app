import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Role } from "../../common/enums/role.enum";
import { RedisService } from "../redis/redis.service";
import { randomUUID } from "crypto";

export interface RefreshSessionPayload {
    userId: string;
    role: Role;
    jti: string;
    previousJti: string;
    rotatedAt?: number;
    ip?: string;
    ua?: string;
}

@Injectable()
export class RefreshSessionService {
    static readonly TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
    private static  readonly REUSE_GRACE_MS = 1000; // 1 second

    constructor(private readonly redisService: RedisService) {}

    private key(sid: string): string{
        return "auth:refresh:" + sid;
    }

    async create(userId: string, role: Role, meta: {ip?: string, ua?: string}): Promise<{sid: string, jti: string}> {
        const sid = randomUUID();
        const jti = randomUUID();

        await this.redisService.setJson(this.key(sid), { userId, role, jti, ...meta }, RefreshSessionService.TTL_SECONDS);

        return { sid, jti };
    }

    async rotate(sid: string, presentedJti: string, userId: string, role: Role): Promise<string>{
        const session = (await this.redisService.get<RefreshSessionPayload>(this.key(sid))) as RefreshSessionPayload;
        if(!session || session.userId !== userId || session.role !== role){
            throw new UnauthorizedException("Invalid session");
        }

        const justRotated = session.previousJti === presentedJti && Date.now() - (session.rotatedAt ?? 0) < RefreshSessionService.REUSE_GRACE_MS;

       if(justRotated){
        return session.jti;
       }

       if(session.jti !== presentedJti){
         await this.invalidate(sid);
         throw new UnauthorizedException("Invalid JTI");
       }

       const jti = randomUUID();
       await this.redisService.setJson(this.key(sid), { ...session, previousJti: session.jti, jti, rotatedAt: Date.now() }, RefreshSessionService.TTL_SECONDS);

       return jti;
    }

    async invalidate(sid: string): Promise<void>{
        await this.redisService.delete(this.key(sid));
    }
}