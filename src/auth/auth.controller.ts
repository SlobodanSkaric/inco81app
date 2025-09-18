import { Body, Controller, Injectable, Post, Req, Res } from '@nestjs/common';
import { AdministratorService } from 'src/administrator/administrator.service';
import { AuthDto } from './dto/auth.dto';
import { AuthLoginDto } from './dto/auth.login.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import * as bcrypt from "bcrypt";
import { Request, Response } from 'express';
import { AuthInfoDto } from './dto/auth.info.dto';
import * as jwt from "jsonwebtoken";
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { get } from 'http';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}
   
    @Post("administrator")
    async administratorLogin(@Body() data: AuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response):Promise<{message: string} | AuthLoginDto | ApiResponse | any>{
            const token = await this.authService.adminstratorLogin(data, req);

            res.cookie("access_token", token, {
                httpOnly: true,
                secure: true, 
                sameSite: 'strict', // Adjust based on your requirements
                maxAge: 15 * 60 * 1000, 
            });

            return { message: "Login successful"}
    } 

    @Post("administrator/logout")
    async logut(@Res({ passthrough: true }) res: Response): Promise<{message: string}>{
        res.clearCookie("access_token");
        return { message: "Logout successful"};
    }

    @Post("user")
    async userLogin(@Body() data: AuthDto, @Req() req: Request): Promise<AuthLoginDto | ApiResponse | any>{
      /*   const user = await this.userServices.getByEmail(data.email);

        if(!user){
            return new ApiResponse("error", -1022, "Email is not exites");
        }
        const passwordChecked = await bcrypt.compareSync(data.password, user.password);

        if(!passwordChecked){
            return new ApiResponse("error", -1013, "Password is not correct");
        }

        const dateFormat = new Date();
        const dateNormailize = dateFormat.setDate(dateFormat.getDate() + 7);
        const dateExp = Math.floor(dateNormailize / 1000);
        const ip = req.ip?req.ip:"Undefined Ip";
        const ua = req.headers["user-agent"]?req.headers["user-agent"] : "Undefined user agent";

        const authInfo = new AuthInfoDto(user.userId, user.email, user.phonenumber, dateExp, ip, ua, "user", ["create","update","delete"]);
        const plainObject = authInfo.getPlainObject();
        const secret = this.configServices.get<string>("SECRET_TOKEN_KEY");
        if (!secret) {
            throw new Error("SECRET_TOKEN_KEY is not defined in configuration");
        }
        const token = jwt.sign(plainObject, secret);

        const authLogin = new AuthLoginDto(user.userId, user.email, token);

        return authLogin; */
    }
}
