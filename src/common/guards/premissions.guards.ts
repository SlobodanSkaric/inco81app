import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { PREMISSIONS_KEY } from "../decorators/premissions.decorators";

@Injectable()
export class PremissionsGuards implements CanActivate{
    constructor(private readonly reflector: Reflector){}

    canActivate(context: ExecutionContext):boolean | Promise<boolean> | Observable<boolean> {
        const requestPremissions = this.reflector.getAllAndOverride<string[]>(PREMISSIONS_KEY,[
            context.getHandler(),
            context.getClass()
        ]);

        if(!requestPremissions || requestPremissions.length === 0){
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if(!user || !user.premissions){
            return false;
        }

        const hasPremissions = () => user.premissions.some((premission: string) => requestPremissions.includes(premission));

        if(!hasPremissions()){
            return false;
        }

        return true;
    }
}