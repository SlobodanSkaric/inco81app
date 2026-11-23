import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddSuperadministratorsDto } from './dtos/add.superadministrators.dto';
import { ApiResponse } from 'src/misc/api.response.dto';
import * as bcrypt from 'bcrypt';
import { Users } from '../../entitets/entities/Users';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class SuperadministratorService {
    constructor(@InjectRepository(Users) private readonly superadministrators: Repository<Users>) {}

    async getUserById(id): Promise<Users | ApiResponse> {
        const superadminisGetById = await this.superadministrators.findOne({
            where: { userId: id, role: Role.SUPER_ADMIN, visibility: 1 },
        });

        if(!superadminisGetById){
            return new ApiResponse('error', 404, 'Superadministrator not found');
        }

        return superadminisGetById;
    }


    async getByEmail(email: string): Promise<Users  | null> {
        const superadminisGetByEmail = await this.superadministrators.findOne({ where: { email: email.trim().toLowerCase() }});

        if(!superadminisGetByEmail){
            return null;
        }

        /* const superadministratorInfo = new SuperadministratorInfoDto(
            superadminisGetByEmail.superAdmistratorId,
            superadminisGetByEmail.username,
            superadminisGetByEmail.email,
            superadminisGetByEmail.phoneNumber? superadminisGetByEmail.phoneNumber : ''
        ); */

        return superadminisGetByEmail;
    }

    async addSuperAdministrators(superadmins: AddSuperadministratorsDto): Promise<Users | ApiResponse> {
        const checkedExisted = await this.superadministrators.findOne({ where: { email: superadmins.email.trim().toLowerCase() }});

        if(checkedExisted){
            return new ApiResponse('error', 409, 'Superadministrator with that email already exists');
        }

        const saltRoun = 10;

        const hashPassword = await bcrypt.hash(superadmins.password, saltRoun);

        const newSuperadmin = new Users();
        newSuperadmin.name = superadmins.name;
        newSuperadmin.lastname = superadmins.lastname;
        newSuperadmin.password = hashPassword;
        newSuperadmin.email = superadmins.email.trim().toLowerCase();
        newSuperadmin.phonenumber = superadmins.phoneNumber;
        newSuperadmin.role = Role.SUPER_ADMIN;

        const saveSuprtAdministrators = await this.superadministrators.save(newSuperadmin);
        
        if(!saveSuprtAdministrators){
            return new ApiResponse('error', 500, 'Could not save new superadministrator');
        }

       

        return saveSuprtAdministrators;
    }
}
