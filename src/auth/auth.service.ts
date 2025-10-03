import { Injectable } from '@nestjs/common';
import { Administrator } from 'entitets/entities/Administrator';
import { Users } from 'entitets/entities/Users';
import { AuthDto } from './dto/auth.dto';
import { AuthLoginDto } from './dto/auth.login.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { AdministratorService } from 'src/administrator/administrator.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly admistrattorServices: AdministratorService,
        private readonly jwtService: JwtService,
    ){}

    async adminstratorLogin(data: AuthDto, req): Promise<AuthLoginDto | ApiResponse | Administrator | any>{
        const checkedAdministrator = await this.admistrattorServices.getByEmail(data.email);

        if(!checkedAdministrator){
            return new ApiResponse("error", -1010, "Email is not exites");
        }

        const passwordChecked = await bcrypt.compare(data.password, checkedAdministrator.password);

        if(!passwordChecked){
          return new ApiResponse("error", -1011, "Password is not correct");
        }

        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;//normalize ip
        const ua = req.headers["user-agent"]?req.headers["user-agent"]:"Undefined user agent";

        const payload = {
            id: checkedAdministrator.adminId,
            email: checkedAdministrator.email,
            phonenumber: checkedAdministrator.phonenumber,
            role: "administrator",
            permissions: ["create","update","delete"],
            ip: ip,
            ua: ua
        }

        const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });

        return accessToken;
       
    }

    async userLogin(data: AuthDto): Promise<AuthLoginDto | ApiResponse | Users | any>{
        return null;
    }

}
