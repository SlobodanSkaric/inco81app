import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'entitets/entities/Administrator';
import { Users } from 'entitets/entities/Users';
import { Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import { AuthLoginDto } from './dto/auth.login.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Users) private readonly usersRepisitory: Repository<Users>,
        @InjectRepository(Administrator) private readonly administratorRepisitory: Repository<Administrator>
    ){}

    /* async administratorLogin(data: AuthDto):Promise<AuthLoginDto | ApiResponse>{
        const checkedAdmin = await this.administratorRepisitory.findOne({ where: { email: data.email } });

        if(!checkedAdmin){
            return new ApiResponse("error", -1010, "Email is not exites");
        }

        const checkedPassword = bcrypt.compareSync(data.pasword, checkedAdmin.password);

        if(!checkedPassword){
            return new ApiResponse("error", -1011, "Password is not correct");
        }

        const dateFormat = 
    } */
}
