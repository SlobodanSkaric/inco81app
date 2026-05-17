import { NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";


import "express";
import { GetUserHostInfo } from "src/misc/get.user.host.info";
import { ConfigService } from "@nestjs/config";
declare module "express" {
    interface Request {
        fingerprint?:{
            ip: string;
            userAgent: string;
            acceptLenguage: string;
            deviceFingerprint: {};
            route: string;
            ts: Date;
        };
        userIdreq?: any;
        role?: any;
    }
}

interface JwtPaload {
    id: number;
    email: string;
    phonenumber: string;
    role: string;
    permissions: string[];
    ip: string;
    ua: string;
}

export class FingerprintMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction){
       
        this.attachedFingerprint(req);

        const decodeToken = this.validationToken(req);
       
        const userId = decodeToken.id || null;
        
        req.userIdreq = userId;
        req.role = decodeToken.role || null;
        next();
    }

    private attachedFingerprint(req: Request): void{
        const ip = this.extractsIp(req);
        const ua = (req.headers["user-agent"] || "unknown").toString();
        const acceptLenguage = (req.headers["accept-language"] || "unknown").toString();
        const deviceFingerprint = req.headers["device-fingerprint"] || req.cookies?.deviceFingerprint || "unknown";

        const userInfo = new GetUserHostInfo();
        const hostInfo = userInfo.getUserHostInfo(req);

        let fingerprintDatas = {};


        if(deviceFingerprint === "unknown"){
            fingerprintDatas ={
                userAgent: hostInfo.ua,
                os: hostInfo.os,
                engine: hostInfo.engine,
                cpu: hostInfo.cpu,
            }
        }else{
            fingerprintDatas = deviceFingerprint;
        }

        req.fingerprint = {
            ip:ip,
            userAgent:ua,
            acceptLenguage:acceptLenguage,
            deviceFingerprint:fingerprintDatas,
            route:req.originalUrl,
            ts:new Date(),
        }
    }

    private extractsIp(req: Request): string | any{ 
        const ip = req.headers["x-forwarded-from"];
        if(ip){
            return ip.toString().split(",")[0].trim();
        }

        return (req.socket.remoteAddress || "").toString();
    }

    private validationToken(req: Request): JwtPaload | null |any{
        const configService = new ConfigService();
        const token = req.cookies?.access_token;
        const secret = configService.get<string>("SECRET_TOKEN_KEY");

        if(!token) throw new UnauthorizedException("Unauthorized - No token provided");
        if(!secret) throw new Error("Server configuration error - Missing secret key");

        
        if(token && secret){
            try{
                const decode = jwt.verify(token, secret) as JwtPaload;
                if(!decode.id && !decode.role){
                    throw new UnauthorizedException("Unauthorized - Invalid token payload");
                }

                return decode as JwtPaload;
            }catch(err){
                if(err instanceof jwt.TokenExpiredError) throw new UnauthorizedException("Unauthorized - Token expired");
                if(err instanceof jwt.JsonWebTokenError) throw new UnauthorizedException("Unauthorized - Invalid token");
                throw new UnauthorizedException("Unauthorized - Token verification failed");
            }
        }
    }
}