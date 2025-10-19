import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { decode } from "punycode";

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

        req.fingerprint = {//req["fingerprint"]
            ip,
            userAgent:ua,
            acceptLenguage:acceptLang,
            deviceFingerprint:deviceFingerprint,
            route:req.originalUrl,
            ts:new Date(),
        }

        req.user = decodeToken?.id || null;
        next();
    }
}