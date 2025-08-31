import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE_KEYS } from "../decorators/role.decorators";


@Injectable()
export class RoleGuards implements CanActivate {
    constructor(private reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean  {
        const requiredRole = this.reflector.getAllAndOverride<string[]>(ROLE_KEYS, [
            context.getHandler(),
            context.getClass()
        ]);
        
        
        if(!requiredRole){
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if(!user ||!user.role){
            throw new ForbiddenException("User role not found");
        }

        if(!requiredRole.includes(user.role)){
            throw new ForbiddenException("User not allowed");
        }

        return true;
    }
}