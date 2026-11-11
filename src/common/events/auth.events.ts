import { Role } from "../enums/role.enum";

export class SessionsRevokedEvent {
    constructor(public  userId: string, public  role: Role) {}
}