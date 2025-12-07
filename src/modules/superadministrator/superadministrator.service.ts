import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Superadministrator } from 'entitets/entities/Superadministrator';
import { Repository } from 'typeorm';
import { AddSuperadministratorsDto } from './dtos/add.superadministrators.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperadministratorService {
    constructor(@InjectRepository(Superadministrator) private readonly superadministrators: Repository<Superadministrator>) {}

    async getUserById(id): Promise<Superadministrator | ApiResponse> {
        
        const superadminisGetById = await this.superadministrators.findOne({ where: { superAdmistratorId: id }});

        if(!superadminisGetById){
            return new ApiResponse('error', -2000, 'Superadministrator not found');
        }

        return superadminisGetById
    }


    async getsuperadministratorsByEmail(email: string): Promise<Superadministrator | ApiResponse> {
        const superadminisGetByEmail = await this.superadministrators.findOne({ where: { email: email }});

        if(!superadminisGetByEmail){
            return new ApiResponse('error', -2000, 'Superadministrator not found');
        }

        return superadminisGetByEmail
    }

    async addSuperAdministrators(superadmins: AddSuperadministratorsDto): Promise<Superadministrator | ApiResponse> {
        const checkedExisted = await this.superadministrators.findOne({ where: { email: superadmins.email}});

        if(checkedExisted){
            return new ApiResponse('error', -2001, 'Superadministrator with that email already exists');
        }

        const saltRoun = 10;

        const hashPassword = await bcrypt.hash(superadmins.password, saltRoun);

        const newSuperadmin = new Superadministrator();
        newSuperadmin.username = superadmins.username;
        newSuperadmin.password = hashPassword;
        newSuperadmin.email = superadmins.email;
        newSuperadmin.phoneNumber = superadmins.phoneNumber;

        
        
        const saveSuprtAdministrators = await this.superadministrators.save(newSuperadmin);
        
        if(!saveSuprtAdministrators){
            return new ApiResponse('error', -2002, 'Could not save new superadministrator');
        }

        return saveSuprtAdministrators;
    }
}
