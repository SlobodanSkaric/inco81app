import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Request } from "express";
import { Role } from "../../common/enums/role.enum";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RefreshSessionService } from "./refresh.session.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        configService: ConfigService,
        private readonly refreshSessionService: RefreshSessionService,
    ) {
        const secret = configService.get<string>("SECRET_REFRESH_TOKEN_KEY");
        if (!secret) {
            throw new Error("SECRET_REFRESH_TOKEN_KEY is required");
        }
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req.cookies?.refresh_token
            ]),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: {id: number, role: Role, sid?: string, jti?: string}) {
       if(!payload.sid || !payload.jti){
        throw new UnauthorizedException("Invalid session");
       }
       if (!(await this.refreshSessionService.isActive(payload.sid, payload.id.toString(), payload.role))) {
        throw new UnauthorizedException("Invalid session");
       }
       return { id: payload.id, role: payload.role, sid: payload.sid, jti: payload.jti };
    }
}
