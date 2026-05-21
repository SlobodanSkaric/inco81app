import { Injectable } from '@nestjs/common';
import { Administrator } from 'entitets/entities/Administrator';
import { Users } from 'entitets/entities/Users';
import { AuthDto } from './dto/auth.dto';
import { AuthLoginDto } from './dto/auth.login.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { AdministratorService } from '../administrator/administrator.service';
import { UserService } from '../user/user.service';
import { SuperadministratorService } from '../superadministrator/superadministrator.service';
import { AdministratorInfoDto } from '../administrator/dto/administrator.info.dto';
import { UserInfoDto } from '../user/dto/user.info.dto';
import { SuperadministratorInfoDto } from '../superadministrator/dtos/superadministrator.info.dto';
import { AuthUserServices } from './auth.user.services';
import { Superadministrator } from 'entitets/entities/Superadministrator';
import { ConfigService } from '@nestjs/config';
import { Customers } from 'entitets/entities/Customers';
import { GetCustomersDto } from '../customers/dtos/get.customers.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly authUserServices: AuthUserServices,
        private readonly configService: ConfigService
    ){}

    async adminstratorLogin(data: AuthDto, ipuaData): Promise<AuthLoginDto | ApiResponse | Administrator | any>{
        const checkedAdministrator = await this.authUserServices.getUserByEmail(data.email) as Administrator;
        
        if(!checkedAdministrator){
            return new ApiResponse("error", -1010, "Email is not exites");
        }
        const passwordChecked = await bcrypt.compare(data.password, checkedAdministrator.password);
        
        if(!passwordChecked){
          return new ApiResponse("error", -1011, "Password is not correct");
        }

        /* const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? null   //req.socket.remoteAddress its only for production enviroment
        const ua = req.headers["user-agent"]?req.headers["user-agent"]:"Undefined user agent"; */

        
        
        const ip = ipuaData.ip;
        const ua = ipuaData.ua;

        const payload = {
            id: checkedAdministrator.adminId,
            email: checkedAdministrator.email,
            phonenumber: checkedAdministrator.phonenumber,
            role: "administrator",
            permissions: ["create","update","delete"],
            ip: ip,
            ua: ua
        }

        const payloadRefershToken = {
            id: checkedAdministrator.adminId,
            email: checkedAdministrator.email,
            phonenumber: checkedAdministrator.phonenumber,
            role: "administrator",
            permissions: ["create","update","delete"],
            ip: ip,
            ua: ua
        }

        const accessToken = await this.jwtService.signAsync(payload, { secret:  this.configService.get<string>("SECRET_TOKEN_KEY") ,expiresIn: '15m' });
        const refreshToken = await this.jwtService.signAsync(payloadRefershToken, { secret: this.configService.get<string>("SECRET_REFRESH_TOKEN_KEY"),expiresIn: '7d' });

        const administratorInfo = new AdministratorInfoDto(checkedAdministrator.adminId, checkedAdministrator.name, checkedAdministrator.lastname, checkedAdministrator.email, checkedAdministrator.phonenumber);

        return { accessToken, refreshToken, administratorInfo };       
    }

    async userLogin(data: AuthDto, ipuaData): Promise<AuthLoginDto | ApiResponse | Users | any>{
        const checkedUser = await this.authUserServices.getUserByEmail(data.email) as Users;

        if(!checkedUser){
            return new ApiResponse("error", -1022, "Email is not exites");
        }

        const checkedPassword = await bcrypt.compare(data.password, checkedUser.password);

        if(!checkedPassword){
            return new ApiResponse("error", -1023, "Password is not correct");
        }

        /* const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() ?? null  //req.socket.remoteAddress its only for production enviroment
        const ua = req.headers["user-agent"]?req.headers["user-agent"] : "unknown"; */

        const ip = ipuaData.ip;
        const ua = ipuaData.ua;

        const payload = {
            id: checkedUser.userId,
            email: checkedUser.email,
            phonenumber: checkedUser.phonenumber,
            role: "user",
            permissions: ["delete","update"],
            ip: ip,
            ua: ua
        }

        const payloadRefreshToken = {
            id: checkedUser.userId,
            email: checkedUser.email,
            phonenumber: checkedUser.phonenumber,
            role: "user",
            permissions: ["delete","update"],
            ip: ip,
            ua: ua
        }


        const accessToken = await this.jwtService.signAsync(payload, { secret: this.configService.get<string>("SECRET_TOKEN_KEY"), expiresIn: "15min"});
        const refreshToken = await this.jwtService.signAsync(payloadRefreshToken, { secret: this.configService.get<string>("SECRET_REFRESH_TOKEN_KEY"), expiresIn: "7d"});    

        const userInfo = new UserInfoDto(checkedUser.userId, checkedUser.name, checkedUser.lastname, checkedUser.email, checkedUser.phonenumber);



        return { accessToken, refreshToken, userInfo };
    }


    async loginSuperAdministrators(data: AuthDto, ipuaData): Promise<AuthLoginDto | ApiResponse | any>{
        const checkedSuperadmistrators = await this.authUserServices.getUserByEmail(data.email) as Superadministrator;

        if(!checkedSuperadmistrators){
            return new ApiResponse("error", -1013, "Email is not exists");  
        }

        const checkedPassword = await bcrypt.compare(data.password, checkedSuperadmistrators.password);

        if(!checkedPassword){
            return new ApiResponse("error", -1014, "Password is not correct");
        }

        const ip = ipuaData.ip;
        const ua = ipuaData.ua;
        
        const payload = {
            id: checkedSuperadmistrators.superAdmistratorId,
            email: checkedSuperadmistrators.email,
            phonenumber: checkedSuperadmistrators.phoneNumber,
            role: "superadministrator",
            permissions: ["create","update","delete","manage"],
            ip: ip,
            ua: ua

        }

        const payloadRefrshToken = {
            id: checkedSuperadmistrators.superAdmistratorId,
            email: checkedSuperadmistrators.email,
            phonenumber: checkedSuperadmistrators.phoneNumber,
            role: "superadministrator",
            permissions: ["create","update","delete","manage"],
            ip: ip,
            ua: ua
        }

        const accessToken =  await this.jwtService.signAsync(payload, { secret:this.configService.get<string>("SECRET_TOKEN_KEY"), expiresIn: "15min"});
        const refreshToken = await this.jwtService.signAsync(payloadRefrshToken, { secret: this.configService.get<string>("SECRET_REFRESH_TOKEN_KEY"), expiresIn: "7d"});

        const superadministrastorsInfo = new SuperadministratorInfoDto(checkedSuperadmistrators.superAdmistratorId,checkedSuperadmistrators.username ,checkedSuperadmistrators.email ,checkedSuperadmistrators.phoneNumber ?? "");
     
        return { accessToken, refreshToken, superadministrastorsInfo };
    }

    
    async loginCutomers(data: AuthDto, ipuaData): Promise<AuthLoginDto | ApiResponse | any>{
        const checkedCustomers = await this.authUserServices.getUserByEmail(data.email) as Customers;

        if(!checkedCustomers){
            return new ApiResponse("error", -1013, "Email is not exists");  
        }

        const checkedPassword = await bcrypt.compare(data.password, checkedCustomers.password);

        if(!checkedPassword){
            return new ApiResponse("error", -1014, "Password is not correct");
        }

        const ip = ipuaData.ip;
        const ua = ipuaData.ua;
        
        const payload = {
            id: checkedCustomers.customerId,
            email: checkedCustomers.contactEmail,
            phonenumber: checkedCustomers.phoneNumber,
            role: "customer",
            permissions: ["create","update","delete","manage"],
            ip: ip,
            ua: ua

        }

        const payloadRefrshToken = {
            id: checkedCustomers.customerId,
            email: checkedCustomers.contactEmail,
            phonenumber: checkedCustomers.phoneNumber,
            role: "customer",
            permissions: ["create","update","delete","manage"],
            ip: ip,
            ua: ua
        }

        const accessToken =  await this.jwtService.signAsync(payload, { secret:this.configService.get<string>("SECRET_TOKEN_KEY"), expiresIn: "15min"});
        const refreshToken = await this.jwtService.signAsync(payloadRefrshToken, { secret: this.configService.get<string>("SECRET_REFRESH_TOKEN_KEY"), expiresIn: "7d"});

        const customersInfo = new GetCustomersDto(checkedCustomers.customerId, checkedCustomers.customerName, checkedCustomers.isActive, checkedCustomers.contactEmail, checkedCustomers.phoneNumber ?? "", checkedCustomers.address ?? "");
     
        return { accessToken, refreshToken, customersInfo };
    }

}
