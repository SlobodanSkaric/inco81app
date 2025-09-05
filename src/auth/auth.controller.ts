import { Body, Controller, Post, Req } from '@nestjs/common';
import { AdministratorService } from 'src/administrator/administrator.service';
import { AuthDto } from './dto/auth.dto';
import { AuthLoginDto } from './dto/auth.login.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import * as bcrypt from "bcrypt";
import { Request } from 'express';
import { AuthInfoDto } from './dto/auth.info.dto';
import * as jwt from "jsonwebtoken";
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly administratorService: AdministratorService,
        private readonly userServices: UserService,
        private readonly configServices: ConfigService
    ){}
    @Post("administrator")
    async administratorLogin(@Body() data: AuthDto, @Req() req: Request):Promise<AuthLoginDto | ApiResponse>{
        const checkedAdmin = await this.administratorService.getByEmail(data.email);

        if(!checkedAdmin){
            return new ApiResponse("error", -1010, "Email is not exites");
        }
        const checkedPassword = await bcrypt.compare(data.password, checkedAdmin.password);

        if(!checkedPassword){
            return new ApiResponse("error", -1011, "Password is not correct");
        }

        const dateFormat = new Date();
        const dateNormailize = dateFormat.setDate(dateFormat.getDate() + 7);
        const dateExp = Math.floor(dateNormailize / 1000);
        const ip = req.ip?req.ip: "Undefined Ip";
        const ua = req.headers["user-agent"]?req.headers["user-agent"]:"Undefined user agent";

        const authInfo = new AuthInfoDto(checkedAdmin.adminId, checkedAdmin.email, checkedAdmin.phonenumber, dateExp, ip, ua, "administrator", ["create","update","delete"]);
        const plainObject = authInfo.getPlainObject();
        const secret = this.configServices.get<string>("SECRET_TOKEN_KEY");
        if (!secret) {
            throw new Error("SECRET_TOKEN_KEY is not defined in configuration");
        }
        const token = jwt.sign(plainObject, secret);

        const authLogin = new AuthLoginDto(checkedAdmin.adminId, checkedAdmin.email, token);


        return authLogin;

    } 

    @Post("user")
    async userLogin(@Body() data: AuthDto, @Req() req: Request): Promise<AuthLoginDto | ApiResponse>{
        const user = await this.userServices.getByEmail(data.email);

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

        return authLogin;
    }
}
