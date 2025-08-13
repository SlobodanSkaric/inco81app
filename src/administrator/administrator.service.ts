import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'entitets/entities/Administrator';
import { Repository } from 'typeorm';
import { AdministratorInfoDto } from './dto/administrator.info.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AdministratorAddDto } from './dto/administrator.add.dto';
import * as bcrypt from "bcrypt";

@Injectable()
export class AdministratorService {
    constructor(@InjectRepository(Administrator) private readonly administratorEntitets: Repository<Administrator>){}

    async getAllAdmin(): Promise<AdministratorInfoDto[] | ApiResponse>{
        const getAdmin = await this.administratorEntitets.find();

        if(getAdmin.length === 0){
            return new ApiResponse("error", -1006, "No Administrator");
        }

        const admin: AdministratorInfoDto[] = [];

        getAdmin.forEach((data) =>{
            admin.push(new AdministratorInfoDto(data.adminId, data.name, data.lastname, data.email, data.phonenumber));
        });


        return admin;
    }

    async getByEmail(email: string): Promise<Administrator | null>{
        const admins = await this.administratorEntitets.findOne({ where : { email: email } });

        if(!admins){
            return null;
        }

        return admins;
    }


    async getById(id: number): Promise<AdministratorInfoDto | ApiResponse>{
        const getAdmin = await this.administratorEntitets.findOne({ where: { adminId: id } });

        if(!getAdmin){
            return new ApiResponse("error", -1007, "Adminstrator for this id is not exists");
        }

        return new AdministratorInfoDto(getAdmin.adminId, getAdmin.name, getAdmin.lastname, getAdmin.email, getAdmin.phonenumber);
    }

    

    async addAdministratorServices(data: AdministratorAddDto): Promise<AdministratorInfoDto | ApiResponse>{
        const admin = new Administrator();
        const saltRound = 10;

        admin.name = data.name;
        admin.lastname = data.lastname;
        admin.email = data.email;
        admin.phonenumber = data.phonenumber;

        const passwordHas = await bcrypt.hash(data.password, saltRound);

        admin.password = passwordHas;

        try{
            const saveAdministrator = await this.administratorEntitets.save(admin);
            return await this.getById(saveAdministrator.adminId);
        }catch(error){
            if(error.errno === 1062 || error.errno === 23505){
                throw new ConflictException("Administrator for this email or phonenumber is  existes");
            }
            return error;
        }
    }
}
