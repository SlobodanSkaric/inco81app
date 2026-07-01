import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorators";

@Injectable()
export class PermissionsGuards implements CanActivate{
    constructor(private readonly reflector: Reflector){}

    canActivate(context: ExecutionContext):boolean | Promise<boolean> | Observable<boolean> {
        const requestPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY,[
            context.getHandler(),
            context.getClass()
        ]);

        if(!requestPermissions || requestPermissions.length === 0){
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if(!user || !user.permissions){
            return false;
        }

        const hasPermissions = () => user.permissions.some((permission: string) => requestPermissions.includes(permission));

        if(!hasPermissions()){
            return false;
        }

        return true;
    }
}