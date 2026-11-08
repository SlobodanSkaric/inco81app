import { Body, Controller, Get, Injectable, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthLoginDto } from './dto/auth.login.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GetIp } from 'src/common/decorators/ip.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResult } from 'src/common/decorators/swagger.decorator';
import { Throttle } from '@nestjs/throttler';
import { JwtRefreshGuards } from './jwtRefreshGuards';
import { clearAuthCookies, setAuthCookies } from './auth.cookies';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}
   
    @ApiOperation({ summary: 'Administrator login', description: 'Sets access_token and refresh_token httpOnly cookies.' })
    @ApiResult(undefined, { status: 201 })
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @Post("administrator")
    async administratorLogin(@Body() data: AuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response):Promise<{message: string} | AuthLoginDto | ApiResponse | any>{             
           const ip = typeof req.headers["x-forwarded-for"] === "string" ? req.headers["x-forwarded-for"].split(",")[0].trim() : null   //req.socket.remoteAddress its only for production enviroment
           const ipSocket = req.socket.remoteAddress;
           const ua = req.headers["user-agent"]?req.headers["user-agent"]:"Undefined user agent";
           const ipuaData = {
            ip: ipSocket,
            ua: ua
           }
          
           const tokens = await this.authService.adminstratorLogin(data, ipuaData);   
           
           if(tokens instanceof ApiResponse){
            return tokens;
           }

          setAuthCookies(res, tokens);

            
           
            return { message: "Login successful", administrators: tokens.administratorInfo };
    } 

    @ApiOperation({ summary: 'Administrator logout', description: 'Clears auth cookies.' })
    @Post("administrator/logout")
    async logut(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{message: string}>{
        await this.authService.logout(req.cookies?.refresh_token);
        clearAuthCookies(res);
        return { message: "Logout successful"};
    }

    @ApiOperation({ summary: 'User login', description: 'Sets access_token and refresh_token httpOnly cookies.' })
    @ApiResult(undefined, { status: 201 })
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @Post("user")
    async userLogin(@Body() data: AuthDto, @Req() req: Request, @Res({ passthrough: true}) res: Response): Promise<AuthLoginDto | ApiResponse | any>{
        const ip = typeof req.headers["x-forwarded-for"] === "string" ? req.headers["x-forwarded-for"].split(",")[0].trim() : null   //req.socket.remoteAddress its only for production enviroment
        const ua = req.headers["user-agent"]?req.headers["user-agent"]:"Undefined user agent";
        const ipuaData = {
            ip: ip,
            ua: ua
        }
        const token = await this.authService.userLogin(data, ipuaData);

       setAuthCookies(res, token);



        return { messages: "Login successful", user: token.userInfo };
    }

    @ApiOperation({ summary: 'User logout', description: 'Clears auth cookies.' })
    @Post("user/logout")
    async userLogout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{message: string}>{
        await this.authService.logout(req.cookies?.refresh_token);
        clearAuthCookies(res);
        return { message: "Logout successful" };
    }


    @ApiOperation({ summary: 'Superadministrator login', description: 'Sets access_token and refresh_token httpOnly cookies.' })
    @ApiResult(undefined, { status: 201 })
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @Post("superadministrators/login")
    async loginSuperAdministrators(@Body() superadminsData: AuthDto, @Req() req: Request,@GetIp() ip:string ,@Res({ passthrough: true }) res: Response): Promise<{message: string} |any> {
        const ua = req.headers["user-agent"]?req.headers["user-agent"] : "unknown"; 
        
        const ipuaData = {
            ip: ip,
            ua: ua
        }
        const token = await this.authService.loginSuperAdministrators(superadminsData, ipuaData);
        
        if(token instanceof ApiResponse){
            return token;
        }

       setAuthCookies(res, token);


        return { message: "Superadministrators Login successful", superadministrators: token.superadministrastorsInfo  };
    }

    @ApiOperation({ summary: 'Superadministrator logout', description: 'Clears auth cookies.' })
    @Post("superadministrators/logout")
    async logoutSuperAdministrators(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{message: string}> {
        await this.authService.logout(req.cookies?.refresh_token);
        clearAuthCookies(res);
        return { message: "Superadministrators Logout successful" };
    }

    @ApiOperation({ summary: 'Customer login', description: 'Sets access_token and refresh_token httpOnly cookies.' })
    @ApiResult(undefined, { status: 201 })
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post("customers/login")
    async loginCustomers(@Body() customersData: AuthDto, @Req() req: Request, @GetIp() ip: string, @Res({ passthrough: true }) res: Response): Promise<{message: string} | any>{
        const ua = req.headers["user-agent"]?req.headers["user-agent"] : "unknown";

        const ipuaData = {
            ip: ip,
            ua: ua
        }

        const token = await this.authService.loginCutomers(customersData, ipuaData);

        if(token instanceof ApiResponse){
            return token;
        }

      setAuthCookies(res, token);

        return { message: "Customers Login successful", customers: token.customersInfo };
    }

    @ApiOperation({ summary: 'Refresh token', description: 'Refreshes access_token and refresh_token httpOnly cookies.' })
    @Throttle({ default: { limit: 30, ttl: 60000 } })
    @UseGuards(JwtRefreshGuards)
    @Post("refresh")
    async refresh(@Req() req: Request & { user: { id: number; role: Role; sid: string; jti: string } }, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.refresh(req.user);
        setAuthCookies(res, tokens);
        return { message: "Refresh successful" };
    }

    @ApiOperation({ summary: 'Customer logout', description: 'Clears auth cookies.' })
    @Post("customers/logout")
    async logoutCustomers(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{message: string}>{
        await this.authService.logout(req.cookies?.refresh_token);
        clearAuthCookies(res);
        return { message: "Customers Logout successful" };
    }
}
