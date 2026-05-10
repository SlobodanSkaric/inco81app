import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";


import "express";
import { GetUserHostInfo } from "src/misc/get.user.host.info";
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

export class FingerprintMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction){
        const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
        const ua = (req.headers["user-agent"] || "unknown").toString();
        const acceptLang = (req.headers["accept-language"] || "unknown").toString();
        const deviceFingerprint = req.headers["device-fingerprint"] || req.cookies?.deviceFingerprint || "unknown";

        const token = req.cookies?.access_token;
        
        let decodeToken: any = null;
        const secret = process.env.SECRET_TOKEN_KEY;
        if (token && secret) {
            try {
                decodeToken = jwt.verify(token, secret);       
            } catch (err) {
                console.warn("JWT verification failed:", err);
            }
        }


        const userInfo = new GetUserHostInfo();
        const hostInfo = userInfo.getUserHostInfo(req);

        //console.log("User host info:", hostInfo);

        req.fingerprint = {
            ip:ip,
            userAgent:ua,
            acceptLenguage:acceptLang,
            deviceFingerprint:{
                userAgent: hostInfo.ua,
                os: hostInfo.os,
                engine: hostInfo.engine,
                cpu: hostInfo.cpu,

            },
            route:req.originalUrl,
            ts:new Date(),
        }
        //console.log("Constructed fingerprint:", req.fingerprint);
        if(!decodeToken){
            next();
            res.status(401).json({ message: "Unauthorized - Invalid or missing token", code: -1 } );
            return;
        }
       
        const userId = decodeToken.id || null;
        
        req.userIdreq = userId;
        req.role = decodeToken.role || null;
        next();
    }
}