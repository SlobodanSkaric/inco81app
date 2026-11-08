import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { AdministratorService } from "../administrator/administrator.service";
import { SuperadministratorService } from "../superadministrator/superadministrator.service";
import { Users } from "src/entitets/entities/Users";
import { ApiResponse } from "src/misc/api.response.dto";
import { SuperadministratorInfoDto } from "../superadministrator/dtos/superadministrator.info.dto";
import { CustomersService } from "../customers/customers.service";
import { Customers } from "src/entitets/entities/Customers";
import { Role } from "../../common/enums/role.enum";

@Injectable()
export class AuthUserServices{
    constructor(
        private readonly userServices: UserService,
    ){}

    async getUserByEmail(email: string):Promise<Users | Users  | Customers |  ApiResponse | null>{//refactoring for role, implement switch case for role and return only user info dto for all of them
        const user = await this.userServices.getByEmail(email);
        if(user) return user

        return null;
    }

    async findByIdAndRole(id: number, role: Role): Promise<Users | null>{
        const user = await this.userServices.findUserById(id);

        return user && user.role === role ? user : null;
    }
}