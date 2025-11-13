import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Request } from "express";

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

    async validate(payload: any) {
        return {
            id: payload.id,
            email: payload.email,
            phonenumber: payload.phonenumber,
            role: payload.role,
            permissions: payload.permissions,
            ip: payload.ip,
            ua: payload.ua
        };
    }
}