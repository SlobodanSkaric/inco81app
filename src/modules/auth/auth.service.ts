import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Users } from 'src/entitets/entities/Users';
import { AuthDto } from './dto/auth.dto';
import { AuthLoginDto } from './dto/auth.login.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { AdministratorInfoDto } from '../administrator/dto/administrator.info.dto';
import { UserInfoDto } from '../user/dto/user.info.dto';
import { SuperadministratorInfoDto } from '../superadministrator/dtos/superadministrator.info.dto';
import { AuthUserServices } from './auth.user.services';
import { ConfigService } from '@nestjs/config';
import { Customers } from 'src/entitets/entities/Customers';
import { GetCustomersDto } from '../customers/dtos/get.customers.dto';
import { LoginAttemptsService } from './login.attempts.service';
import { Role } from '../../common/enums/role.enum';
import { CustomersService } from '../customers/customers.service';
import { RefreshSessionService } from './refresh.session.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private static readonly DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);
    constructor(
        private readonly jwtService: JwtService,
        private readonly authUserServices: AuthUserServices,
        private readonly configService: ConfigService,
        private readonly loginAttemptsService: LoginAttemptsService,
        private readonly customersService: CustomersService,
        private readonly refreshSessionService: RefreshSessionService
    ){}

    private async validateCredentials(email: string, password: string, role: string): Promise<Users | null> {
        await this.loginAttemptsService.assetorsNotLocked(email);
        let user = Object();

        if(role === Role.USER || role === Role.ADMIN || role === Role.SUPER_ADMIN){
            user = await this.authUserServices.getUserByEmail(email) as Users | null;
        }else if(role === Role.CUSTOMER){
            user = await this.customersService.getByEmail(email) as Customers | null;
        }
        
        const passwordChecked = await bcrypt.compare(password, user?.password || AuthService.DUMMY_HASH);
        const inactiveCustomer = role === Role.CUSTOMER && user?.isActive === false;
        if(!user || !passwordChecked ||  user?.role !== role ){
          
            await this.loginAttemptsService.registerFailer(email);
            throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
        
        if(inactiveCustomer){
            throw new UnauthorizedException("Inactive customer");
        }
        await this.loginAttemptsService.resetFailures(email);
        return user;
    }

    private async issueTokens(subject: {id: number, email: string, role: Role}, sid: string, jti: string){
        const accessToken = await this.jwtService.signAsync(
            {id: subject.id, email: subject.email, role: subject.role, sid},
            { secret: this.configService.get<string>("SECRET_TOKEN_KEY"), expiresIn: "15m" }
        )

        const refreshToken = await this.jwtService.signAsync(
            {id: subject.id, role: subject.role, sid, jti},
            { secret: this.configService.get<string>("SECRET_REFRESH_TOKEN_KEY"), expiresIn: "7d" }
        )

        return { accessToken, refreshToken };
    }

    async adminstratorLogin(data: AuthDto, ipuaData): Promise<AuthLoginDto | ApiResponse | Users | any>{
        const checkedAdministrator = await this.validateCredentials(data.email, data.password, Role.ADMIN) as Users | null;
        if(!checkedAdministrator) throw new UnauthorizedException("Invalid credentials");
        const {sid, jti} = await this.refreshSessionService.create(checkedAdministrator.userId.toString(), Role.ADMIN, ipuaData);
        const {accessToken, refreshToken} = await this.issueTokens({id: checkedAdministrator.userId, email: checkedAdministrator.email, role: Role.ADMIN}, sid, jti);

        const administratorInfo = new AdministratorInfoDto(checkedAdministrator?.userId, checkedAdministrator?.name, checkedAdministrator?.lastname, checkedAdministrator?.email, checkedAdministrator?.phonenumber ?? "");

        return { accessToken, refreshToken, administratorInfo };       
    }

    async userLogin(data: AuthDto, ipuaData): Promise<AuthLoginDto | ApiResponse | Users | any>{
        const checkedUser = await this.validateCredentials(data.email, data.password, Role.USER) as Users | null;
        
        if(!checkedUser) throw new UnauthorizedException("Invalid credentials");
        const {sid, jti} = await this.refreshSessionService.create(checkedUser.userId.toString(), Role.USER, ipuaData);
        const {accessToken, refreshToken} = await this.issueTokens({id: checkedUser.userId, email: checkedUser.email, role: Role.USER}, sid, jti);

        const userInfo = new UserInfoDto(checkedUser?.userId, checkedUser?.name, checkedUser?.lastname, checkedUser?.email, checkedUser?.phonenumber ?? "");

        return { accessToken, refreshToken, userInfo };
    }


    async loginSuperAdministrators(data: AuthDto, ipuaData): Promise<AuthLoginDto | ApiResponse | any>{
        const checkedSuperadmistrators = await this.validateCredentials(data.email, data.password, Role.SUPER_ADMIN) as Users | null;
       
        if(!checkedSuperadmistrators) throw new UnauthorizedException("Invalid credentials");
        const {sid, jti} = await this.refreshSessionService.create(checkedSuperadmistrators.userId.toString(), Role.SUPER_ADMIN, ipuaData);
        const {accessToken, refreshToken} = await this.issueTokens({id: checkedSuperadmistrators.userId, email: checkedSuperadmistrators.email, role: Role.SUPER_ADMIN}, sid, jti);

        const superadministrastorsInfo = new SuperadministratorInfoDto(checkedSuperadmistrators?.userId,checkedSuperadmistrators?.name ,checkedSuperadmistrators?.email ,checkedSuperadmistrators?.phonenumber ?? "");
     
        return { accessToken, refreshToken, superadministrastorsInfo };
    }

    
    async loginCutomers(data: AuthDto, ipuaData): Promise<AuthLoginDto | ApiResponse | any>{
       const checkedCustomers = await this.validateCredentials(data.email, data.password, Role.CUSTOMER) as Customers | null;
      
       if(!checkedCustomers) throw new UnauthorizedException("Invalid credentials");
       const {sid, jti} = await this.refreshSessionService.create(checkedCustomers.customerId.toString(), Role.CUSTOMER, ipuaData);
       const {accessToken, refreshToken} = await this.issueTokens({id: checkedCustomers.customerId, email: checkedCustomers.contactEmail, role: Role.CUSTOMER}, sid, jti);

        const customersInfo = new GetCustomersDto(checkedCustomers?.customerId, checkedCustomers?.customerName, checkedCustomers?.isActive, checkedCustomers?.contactEmail, checkedCustomers?.phoneNumber, checkedCustomers?.address);
     
        return { accessToken, refreshToken, customersInfo };
    }

    async refresh(payload: {id: number, role: Role, sid: string, jti: string}){
        const jti = await this.refreshSessionService.rotate(payload.sid, payload.jti, payload.id.toString(), payload.role);

        const account = payload.role === Role.CUSTOMER ? await this.customersService.findCustomerInActive(payload.id) as Customers | null : await this.authUserServices.findByIdAndRole(payload.id, payload.role) as Users | null;

        if(!account){
            await this.refreshSessionService.invalidate(payload.sid);
            throw new UnauthorizedException("Invalid session");
        }

        const email = account instanceof Customers ? account.contactEmail  : account.email;
        return this.issueTokens({id: payload.id, email, role: payload.role}, payload.sid, jti);

    }

    async logout(refreshTokens: string): Promise<void>{
        if(!refreshTokens) return;

        try{
            const payload = await this.jwtService.verifyAsync(refreshTokens, { secret: this.configService.get<string>("SECRET_REFRESH_TOKEN_KEY"), ignoreExpiration: true });
            await this.refreshSessionService.invalidate(payload.sid);
        }catch(error){
            this.logger.error(error);
        }
    }

}
