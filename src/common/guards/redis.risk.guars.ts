import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { RedisService } from "src/modules/redis/redis.service";

/**
 * Blocks authenticated users whose Redis risk score exceeds the threshold.
 * Safe to use after JwtAuthGuards (requires request.user).
 * Prefer JwtStrategy risk check for global coverage; this guard is for explicit routes.
 */
@Injectable()
export class RedisRiskGuards implements CanActivate {
    private static readonly RISK_BLOCK_SCORE = 80;

    constructor(private redisService: RedisService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        const role = request.user?.role;

        if (!userId || !role) {
            return true;
        }

        const risk = await this.redisService.getRiskScore(String(userId), role);
        if (risk && risk.score >= RedisRiskGuards.RISK_BLOCK_SCORE) {
            throw new ForbiddenException(
                risk.reason || "Account temporarily blocked due to risk score",
            );
        }

        return true;
    }
}
