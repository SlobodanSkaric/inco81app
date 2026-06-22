import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EmailService } from "src/modules/email/email.service";

@Injectable()
export class VactionNotificationListener{
    constructor(private readonly emailService: EmailService){}

    @OnEvent('vacation.request.created')
    async handleVacationRequestCreatedEvent(event: any) {
        const subject = 'New Vacation Request';
        const message = `A new vacation request has been created with ID: ${event.requestId} by user ID: ${event.userId}.`;
        console.log('Vacation request created event received:', event);
        await this.emailService.sendEmailToAdministrator(subject, message);
    }

    /*@OnEvent('vacation.request.updated')
    async handleVacationRequestUpdatedEvent(event: any) {
        const subject = 'Vacation Request Updated';
        const message = `Your vacation request with ID: ${event.requestId} has been updated. Status: ${event.status}. Comments: ${event.comments || 'None'}.`;
        // Assuming you have a way to get the user's email based on userId
        const userEmail = await this.getUserEmailById(event.userId);
        await this.emailService.sendEmailToUser(userEmail, subject, event.status, event.comments);
    }*/
}
