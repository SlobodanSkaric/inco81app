import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { RefreshSessionService } from "./refresh.session.service";
import { Request } from "express";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
     constructor(private readonly refreshSessionService: RefreshSessionService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req.cookies?.access_token
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.SECRET_TOKEN_KEY
        });
    }

    async validate(payload: any) {
        if(!payload.sid || !(await this.refreshSessionService.isActive(payload.sid, payload.id.toString(), payload.role))){
            throw new UnauthorizedException("Invalid session");
        }
        return {
            id: payload.id,
            email: payload.email,
            phonenumber: payload.phonenumber,
            role: payload.role,
            permissions: payload.permissions,
            ip: payload.ip,
            ua: payload.ua,
            sid: payload.sid
        };
    }
}