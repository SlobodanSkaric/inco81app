import { Body, Controller, Injectable, Post, Req, Res } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthLoginDto } from './dto/auth.login.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginSuperadministratorsDto } from 'src/superadministrator/dtos/login.superadministrators.dto';

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
    async userLogin(@Body() data: AuthDto, @Req() req: Request, @Res({ passthrough: true}) res: Response): Promise<AuthLoginDto | ApiResponse | any>{
        const token = await this.authService.userLogin(data, req);

        res.cookie("access_token", token,{
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        })

        return { messages: "Login successful"}
    }

    @Post("user/logout")
    async userLogout(@Res({ passthrough:true }) res: Response): Promise<{message: string}>{
        res.clearCookie("access_token");
        return { message: "Logout successful"};
    }


    @Post("superadministrators/login")
    async loginSuperAdministrators(@Body() superadminsData: AuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{message: string}> {
        const token = await this.authService.loginSuperAdministrators(superadminsData, req);

        res.cookie("access_token", token,{
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        })


        return { message: "Superadministrators Login successful"};
    }
}
