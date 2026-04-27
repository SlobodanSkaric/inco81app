import { Req } from "@nestjs/common";
import { request, Request } from "express";
import { UAParser } from "ua-parser-js";

export class GetUserHostInfo {
    userInfo: string = ""

    getUserHostInfo(@Req()req: Request): any{
        const ua = (req.headers["user-agent"])?.toString() || "";
        const parser = new UAParser(ua);
        const result = parser.getResult();
        return result;
    }
}