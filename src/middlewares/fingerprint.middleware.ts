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

interface JwtPayload {
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

        // Extract user ID from token if available (set by Passport guards)
        // Don't validate token here - let guards handle that
        if (req.user?.id) {
            req.userIdreq = req.user.id;
            req.role = req.user.role;
        }
        
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

    private validationToken(req: Request): JwtPayload | null | any {
        // Token validation is now handled by JwtAuthGuards (Passport)
        // This method is kept for backward compatibility but should not be called
        return null;
    }
}