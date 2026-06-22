import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendEmailToAdministrator(subject: string, message:string): Promise<void> {
        console.log("Sending email to administrator");  
        this.sendEmailWithResend(subject, message);
        /*await this.mailerService.sendMail({
            from: process.env.MAIL_FROM,
            to: process.env.ADMIN_EMAIL,
            subject: subject,
            template: './admin-templates',
            context: {
                message: message,
            },
        });*/
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

    async sendEmailWithResend(subject: string, status: string, comments?: string): Promise<void> {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const from = process.env.MAIL_FROM;
        if (!from) {
            throw new Error('MAIL_FROM environment variable is required');
        }

        await resend.emails.send({
            from,
            to: process.env.ADMIN_EMAIL || '',
            subject: subject,
            html: `<p>Status: ${status}</p><p>Comments: ${comments || 'None'}</p>`,
        });
    }
}
