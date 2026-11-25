import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class PermissionsGuards implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const requestPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requestPermissions || requestPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException("Missing authentication");
        }

        if (!user.permissions || !Array.isArray(user.permissions)) {
            throw new UnauthorizedException("Invalid session permissions");
        }

        const hasAllPermissions = requestPermissions.every((permission: string) =>
            user.permissions.includes(permission),
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException("Missing required permissions");
        }

        return true;
    }
}
