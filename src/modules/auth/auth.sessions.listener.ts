import { Injectable } from "@nestjs/common";
import { RefreshSessionService } from "./refresh.session.service";
import { OnEvent } from "@nestjs/event-emitter";
import { SessionsRevokedEvent } from "../../common/events/auth.events";

@Injectable()
export class AuthSessionsListener {
    constructor(private readonly refreshSessionService: RefreshSessionService) {}

    @OnEvent("auth.sessions.revoked")
    async handleSessionsRevokedEvent(event: SessionsRevokedEvent) {
        await this.refreshSessionService.invalidateAllForUser(event.userId.toString(), event.role);
    }
}