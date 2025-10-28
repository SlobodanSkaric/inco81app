import { Injectable } from '@nestjs/common';
import { Administrator } from 'entitets/entities/Administrator';
import { Users } from 'entitets/entities/Users';
import { AuthDto } from './dto/auth.dto';
import { AuthLoginDto } from './dto/auth.login.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { AdministratorService } from 'src/administrator/administrator.service';
import { UserService } from 'src/user/user.service';
import { SuperadministratorService } from 'src/superadministrator/superadministrator.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly admistrattorServices: AdministratorService,
        private readonly jwtService: JwtService,
        private readonly userServices: UserService,
        private readonly superadministratorsServices: SuperadministratorService,
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

    async userLogin(data: AuthDto, req): Promise<AuthLoginDto | ApiResponse | Users | any>{
        const checkedUser = await this.userServices.getByEmail(data.email);

        if(!checkedUser){
            return new ApiResponse("error", -1022, "Email is not exites");
        }

        const checkedPassword = await bcrypt.compare(data.password, checkedUser.password);

        if(!checkedPassword){
            return new ApiResponse("error", -1013, "Password is not correct");
        }

        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress; //modify loclahost ip address
        const ua = req.headers["user-agent"]?req.headers["user-agent"] : "unknown";

        const payload = {
            id: checkedUser.userId,
            email: checkedUser.email,
            phonenumber: checkedUser.phonenumber,
            role: "user",
            permissions: ["delete","update"],
            ip: ip,
            ua: ua
        }


        const accessToken = await this.jwtService.signAsync(payload, { expiresIn: "15min"});

        return accessToken;
    }


    async loginSuperAdministrators(data: AuthDto, req): Promise<AuthLoginDto | ApiResponse | any>{
        const checkedSuperadmistrators = await this.superadministratorsServices.getsuperadministratorsByEmail(data.email);

        if(checkedSuperadmistrators instanceof ApiResponse){
            return checkedSuperadmistrators;
        }

        const checkedPassword = await bcrypt.compare(data.password, checkedSuperadmistrators.password);

        if(!checkedPassword){
            return new ApiResponse("error", -1014, "Password is not correct");
        }

        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const ua = req.headers["user-agent"]?req.headers["user-agent"]:"unknown";

        const payload = {
            id: checkedSuperadmistrators.superAdmistratorId,
            email: checkedSuperadmistrators.email,
            phonenumber: checkedSuperadmistrators.phoneNumber,
            role: "superadministrator",
            permissions: ["create","update","delete","manage"],
            ip: ip,
            ua: ua

        }

        const access_token =  await this.jwtService.signAsync(payload, { expiresIn: "15min"});



        return access_token;
    }

}
