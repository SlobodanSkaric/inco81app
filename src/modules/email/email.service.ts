import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    constructor(
        private readonly mailerService: MailerService,
    ) {}

    async sendEmailToAdministrator(subject: string, message: string): Promise<void> {
        const to = process.env.ADMIN_EMAIL;
        if (!to) {
            throw new Error('ADMIN_EMAIL environment variable is required');
        }
        await this.sendEmailToAddress(to, subject, message);
    }

    async sendEmailToAddress(to: string, subject: string, message: string): Promise<void> {
        await this.sendEmailWithResend(to, subject, message);
    }

    async sendEmailToUser(userEmail: string, subject: string, status: string, comments?: string): Promise<void>{
        await this.mailerService.sendMail({
            from: process.env.MAIL_FROM,
            to: userEmail,
            subject: subject,
            template: './user-templates',
            context: {
                status: status,
                comment: comments || '',
            },
        });
    }

    async sendEmailWithResend(to: string, subject: string, message: string): Promise<void> {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const from = process.env.MAIL_FROM;
        if (!from) {
            throw new Error('MAIL_FROM environment variable is required');
        }
        if (!to) {
            throw new Error('Recipient email is required');
        }

        try{
            await resend.emails.send({
                from,
                to,
                subject: subject,
                html: `<p>${message}</p>`,
            });
        }catch(error){
            this.logger.error('Failed to send email with Resend', error);
            throw new Error('Failed to send email with Resend');
        }
    }
}

