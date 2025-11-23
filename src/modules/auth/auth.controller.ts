import { Body, Controller, Get, Injectable, Post, Req, Res } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthLoginDto } from './dto/auth.login.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}
   
    @Post("administrator")
    async administratorLogin(@Body() data: AuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response):Promise<{message: string} | AuthLoginDto | ApiResponse | any>{
           const tokens = await this.authService.adminstratorLogin(data, req);           

           res.cookie("access_token", tokens.accessToken, {
                httpOnly: true,
                secure: true, 
                sameSite: 'strict', // Adjust based on your requirements
                maxAge: 15 * 60 * 1000, 
            });

            res.cookie("refresh_token", tokens.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            
           
            return { message: "Login successful", administrators: tokens.administratorInfo };
    } 

    @Post("administrator/logout")
    async logut(@Res({ passthrough: true }) res: Response): Promise<{message: string}>{
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        return { message: "Logout successful"};
    }

    @Post("user")
    async userLogin(@Body() data: AuthDto, @Req() req: Request, @Res({ passthrough: true}) res: Response): Promise<AuthLoginDto | ApiResponse | any>{
        const token = await this.authService.userLogin(data, req);

        res.cookie("access_token", token.accessToken,{
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        })

        res.cookie("refresh_token", token.refreshToken,{
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })



        return { messages: "Login successful", user: token.userInfo };
    }

    @Post("user/logout")
    async userLogout(@Res({ passthrough:true }) res: Response): Promise<{message: string}>{
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        return { message: "Logout successful"};
    }


    @Post("superadministrators/login")
    async loginSuperAdministrators(@Body() superadminsData: AuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{message: string} |any> {
        const token = await this.authService.loginSuperAdministrators(superadminsData, req);

        res.cookie("access_token", token.access_token,{
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        })

        res.cookie("refresh_token", token.refreshToken, {
             httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 34 * 60 * 60 * 1000
        })


        return { message: "Superadministrators Login successful", superadministrators: token.superadministrastorsInfo  };
    }

    @Post("superadministrators/logout")
    async logoutSuperAdministrators(@Res({ passthrough: true }) res: Response): Promise<{message: string}> {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        return { message: "Superadministrators Logout successful" };
    }
}
