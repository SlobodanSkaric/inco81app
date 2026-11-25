import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EmailService } from "src/modules/email/email.service";
import { VactionRequestCreatedEvent, VactionRequestUpdatedEvent } from "./vaction.events.def";

@Injectable()
export class VactionNotificationListener {
    private readonly logger = new Logger(VactionNotificationListener.name);

    constructor(private readonly emailService: EmailService) {}

    @OnEvent("vacation.request.created")
    async handleVacationRequestCreatedEvent(event: VactionRequestCreatedEvent) {
        const subject = "New Vacation Request";
        const message = `A new vacation request has been created with ID: ${event.requestId} by user ID: ${event.userId}.`;
        try {
            if (event.managerEmail) {
                await this.emailService.sendEmailToAddress(event.managerEmail, subject, message);
            } else {
                this.logger.warn(
                    `No manager email for vacation ${event.requestId}; falling back to ADMIN_EMAIL`,
                );
                await this.emailService.sendEmailToAdministrator(subject, message);
            }
        } catch (error) {
            this.logger.error(
                `Failed to notify admin about vacation ${event.requestId}`,
                error instanceof Error ? error.stack : error,
            );
        }
    }

    @OnEvent("vacation.request.updated")
    async handleVacationRequestUpdatedEvent(event: VactionRequestUpdatedEvent) {
        const subject = "Vacation Request Updated";
        try {
            await this.emailService.sendEmailToUser(
                event.userEmail,
                subject,
                event.status,
                event.comments,
            );
        } catch (error) {
            this.logger.error(
                `Failed to notify user ${event.userId} about vacation ${event.requestId}`,
                error instanceof Error ? error.stack : error,
            );
        }
    }
}
