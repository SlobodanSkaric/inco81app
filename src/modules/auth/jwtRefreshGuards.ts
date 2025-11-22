import { AuthGuard } from "@nestjs/passport";

export class JwtRefreshGuards extends AuthGuard('jwt-refresh'){}