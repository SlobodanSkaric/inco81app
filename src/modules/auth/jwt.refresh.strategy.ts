import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Request } from "express";
import { Role } from "../../common/enums/role.enum";
import { UnauthorizedException } from "@nestjs/common";

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req.cookies?.refresh_token
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.SECRET_REFRESH_TOKEN_KEY
        });
    }

    async validate(payload: {id: number, role: Role, sid?: string, jti?: string}) {
       if(!payload.sid || !payload.jti){
        throw new UnauthorizedException("Invalid session");
       }
       return { id: payload.id, role: payload.role, sid: payload.sid, jti: payload.jti };
    }
}