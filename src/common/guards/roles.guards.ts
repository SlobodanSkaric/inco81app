import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE_KEYS } from "../decorators/role.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class RoleGuards implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const requiredRole = this.reflector.getAllAndOverride<string[]>(ROLE_KEYS, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Fail closed: authenticated routes must declare @Roles(...)
        if (!requiredRole || requiredRole.length === 0) {
            throw new ForbiddenException("Route roles are not configured");
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException("User role not found");
        }

        if (!requiredRole.includes(user.role)) {
            throw new ForbiddenException("User not allowed");
        }

        return true;
    }
}
