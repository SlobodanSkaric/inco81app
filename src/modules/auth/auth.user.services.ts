import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { AdministratorService } from "../administrator/administrator.service";
import { SuperadministratorService } from "../superadministrator/superadministrator.service";
import { Users } from "entitets/entities/Users";
import { Administrator } from "entitets/entities/Administrator";
import { Superadministrator } from "entitets/entities/Superadministrator";
import { ApiResponse } from "src/misc/api.response.dto";
import { SuperadministratorInfoDto } from "../superadministrator/dtos/superadministrator.info.dto";

@Injectable()
export class AuthUserServices{
    constructor(
        private readonly userServices: UserService,
        private readonly administratorService: AdministratorService,
        private readonly superadministratorsServices: SuperadministratorService,
    ){}

    async getUserByEmail(email: string):Promise<Users | Administrator | Superadministrator |  ApiResponse | null>{//refactoring for role, implement switch case for role and return only user info dto for all of them
        const user = await this.userServices.getByEmail(email);
        if(user) return user

        const administrator = await this.administratorService.getByEmail(email);
        if(administrator) return administrator;
        

        const superadministrator = await this.superadministratorsServices.getByEmail(email);
        if(superadministrator) return superadministrator;

        return null;
    }
}