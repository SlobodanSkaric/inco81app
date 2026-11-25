import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { RefreshSessionService } from "./refresh.session.service";
import { Request } from "express";
import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthUserServices } from "./auth.user.services";
import { CustomersService } from "../customers/customers.service";
import { Role } from "../../common/enums/role.enum";
import { RedisService } from "../redis/redis.service";
import { Users } from "src/entitets/entities/Users";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private static readonly RISK_BLOCK_SCORE = 80;

    constructor(
        private readonly refreshSessionService: RefreshSessionService,
        private readonly authUserServices: AuthUserServices,
        private readonly customersService: CustomersService,
        private readonly redisService: RedisService,
        configService: ConfigService,
    ) {
        const secret = configService.get<string>("SECRET_TOKEN_KEY");
        if (!secret) {
            throw new Error("SECRET_TOKEN_KEY is required");
        }
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req.cookies?.access_token,
            ]),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        if (
            !payload.sid ||
            !(await this.refreshSessionService.isActive(
                payload.sid,
                payload.id.toString(),
                payload.role,
            ))
        ) {
            throw new UnauthorizedException("Invalid session");
        }

        if (payload.role === Role.CUSTOMER) {
            const customer = await this.customersService.findCustomerInActive(payload.id);
            if (!customer) {
                await this.refreshSessionService.invalidate(payload.sid);
                throw new UnauthorizedException("Invalid session");
            }
        } else {
            const user = (await this.authUserServices.findByIdAndRole(
                payload.id,
                payload.role,
            )) as Users | null;
            if (!user || user.visibility === 0) {
                await this.refreshSessionService.invalidate(payload.sid);
                throw new UnauthorizedException("Invalid session");
            }
        }

        const risk = await this.redisService.getRiskScore(String(payload.id), payload.role);
        if (risk && risk.score >= JwtStrategy.RISK_BLOCK_SCORE) {
            throw new ForbiddenException("Account temporarily blocked due to risk score");
        }

        return {
            id: payload.id,
            email: payload.email,
            role: payload.role,
            permissions: payload.permissions,
            sid: payload.sid,
        };
    }
}
