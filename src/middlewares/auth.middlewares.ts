import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { AdministratorService } from "src/administrator/administrator.service";
import * as jwt from "jsonwebtoken";
import { NextFunction, Request } from "express";

@Injectable()
export class AuthMiddleware implements NestMiddleware {

    constructor(
        private readonly adminstratorServices: AdministratorService
    ){}
    async use(req: Request, res: Request, next: NextFunction) {
        const getToken = req.headers["authorization"];

        if(!getToken){
            throw new UnauthorizedException("Authorization header is missing");
        }

        const tokenSplit = getToken.split(" ");

        if(tokenSplit[0] !== "Bearer" || !tokenSplit[1]){
            throw new UnauthorizedException("Token is not valid");
        }

        const token = tokenSplit[1];
        const secretKey = process.env.SECRET_TOKEN_KEY;
        if (!secretKey) {
            throw new UnauthorizedException("Secret token key is not defined");
        }
        let tokenVerify = jwt.verify(token, secretKey);

        if (typeof tokenVerify !== "object" || tokenVerify === null || !("id" in tokenVerify)) {
            throw new UnauthorizedException("Invalid token payload");
        }

        let admin = await this.adminstratorServices.getById(tokenVerify.id);

        if(!admin){
            throw new UnauthorizedException("Token not valid1")
        }

        
        if (('email' in admin && admin.email) && ("phonenumber" in admin && admin.phonenumber)) {
            if(admin.email !== tokenVerify.email || admin.phonenumber !== tokenVerify.phonenumber){
                throw new UnauthorizedException("Token not valid2");
            }
        }
        
        const ip = req.ip;
        const ua = req.headers["user-agent"];
        const current = Math.floor(Date.now() / 1000);

        if(tokenVerify.ip !== ip){
            throw new UnauthorizedException("Token not valid3");
        }

        if(tokenVerify.ua !== ua){
            throw new UnauthorizedException("Token not valid4");
        }
        
        if(tokenVerify.dateExp < current){
            throw new UnauthorizedException("Token expired");
        }
        next();    }

}