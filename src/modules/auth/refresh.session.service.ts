import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Role } from "../../common/enums/role.enum";
import { RedisService } from "../redis/redis.service";
import { randomUUID } from "crypto";
import { LoginMeta } from "./auth.service";
import { normalizeClient } from "../../misc/normalize.client";

export interface RefreshSessionPayload {
    userId: string;
    role: Role;
    jti: string;
    previousJti?: string;
    rotatedAt?: number;
    ip?: string;
    ua?: string;
}

@Injectable()
export class RefreshSessionService {
    static readonly TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
    /** Short grace for in-flight duplicate refresh from the same client (network retry). */
    private static readonly REUSE_GRACE_MS = 250;

    constructor(private readonly redisService: RedisService) {}

    private key(sid: string): string {
        return "auth:refresh:" + sid;
    }

    private userKey(role: Role, userId: string): string {
        return `auth:refresh:user:${role}:${userId}`;
    }

    async create(userId: string, role: Role, meta: { ip?: string; ua?: string }): Promise<{ sid: string; jti: string }> {
        const sid = randomUUID();
        const jti = randomUUID();

        await this.redisService.setJson(
            this.key(sid),
            { userId, role, jti, ...meta },
            RefreshSessionService.TTL_SECONDS,
        );
        await this.redisService.addToSet(this.userKey(role, userId), sid, RefreshSessionService.TTL_SECONDS);
        return { sid, jti };
    }

    /**
     * Atomically rotate refresh jti using Redis WATCH/MULTI compare-and-set.
     * Concurrent rotations with the same jti: only one wins; loser retries or fails.
     */
    async rotate(
        sid: string,
        presentedJti: string,
        userId: string,
        role: Role,
        ipuaData: LoginMeta,
    ): Promise<string> {
        const key = this.key(sid);
        const maxAttempts = 5;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await this.redisService.watch(key);
            const session = (await this.redisService.get<RefreshSessionPayload>(key)) as RefreshSessionPayload | null;

            if (!session || session.userId !== userId || session.role !== role) {
                await this.redisService.unwatch();
                throw new UnauthorizedException("Invalid session");
            }

            const current = normalizeClient(ipuaData.ua);
            const stored = session.ua ? normalizeClient(session.ua) : null;
            if (stored && current && stored !== current) {
                await this.redisService.unwatch();
                await this.invalidate(sid);
                throw new UnauthorizedException("Invalid user agent");
            }

            const now = Date.now();
            const justRotated =
                session.previousJti === presentedJti &&
                now - (session.rotatedAt ?? 0) < RefreshSessionService.REUSE_GRACE_MS;

            if (justRotated) {
                await this.redisService.unwatch();
                return session.jti;
            }

            if (session.jti !== presentedJti) {
                await this.redisService.unwatch();
                await this.invalidate(sid);
                throw new UnauthorizedException("Invalid JTI");
            }

            const jti = randomUUID();
            const nextPayload: RefreshSessionPayload = {
                ...session,
                previousJti: session.jti,
                jti,
                rotatedAt: now,
                ip: ipuaData.ip ?? session.ip,
                ua: session.ua ?? ipuaData.ua,
            };

            const ok = await this.redisService.compareAndSetJson(
                key,
                nextPayload,
                RefreshSessionService.TTL_SECONDS,
            );

            if (ok) {
                await this.redisService.addToSet(
                    this.userKey(role, userId),
                    sid,
                    RefreshSessionService.TTL_SECONDS,
                );
                return jti;
            }
            // Contention — retry with a fresh watch
        }

        throw new UnauthorizedException("Invalid session");
    }

    async isActive(sid: string, userId: string, role: Role): Promise<boolean> {
        const session = (await this.redisService.get<RefreshSessionPayload>(this.key(sid))) as RefreshSessionPayload | null;
        return !!session && session.userId === userId && session.role === role;
    }

    async invalidate(sid: string): Promise<void> {
        const session =
            ((await this.redisService.get<RefreshSessionPayload>(this.key(sid))) as RefreshSessionPayload | null) ||
            null;
        await this.redisService.delete(this.key(sid));
        if (session) {
            await this.redisService.removeFromSet(this.userKey(session.role, session.userId), sid);
        }
    }

    async invalidateAllForUser(userId: string, role: Role): Promise<void> {
        const indexKey = this.userKey(role, userId);
        const sids = await this.redisService.getSet(indexKey);
        for (const sid of sids) {
            await this.redisService.delete(this.key(sid));
        }
        await this.redisService.delete(indexKey);
    }
}
