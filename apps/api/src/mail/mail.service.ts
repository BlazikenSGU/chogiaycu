import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly config: ConfigService) { }

    async sendResetPasswordEmail(
        to: string,
        resetUrl: string,
    ): Promise<void> {
        const apiKey = this.config.getOrThrow<string>(
            'BREVO_API_KEY',
        );

        const senderEmail = this.config.getOrThrow<string>(
            'MAIL_FROM_EMAIL',
        );

        const senderName = this.config.get<string>(
            'MAIL_FROM_NAME',
            '86Market',
        );

        const response = await fetch(
            'https://api.brevo.com/v3/smtp/email',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey,
                },
                body: JSON.stringify({
                    sender: {
                        name: senderName,
                        email: senderEmail,
                    },
                    to: [{ email: to }],
                    subject: '86Market - Đặt lại mật khẩu',
                    textContent: [
                        'Bạn đã yêu cầu đặt lại mật khẩu 86Market.',
                        '',
                        `Đặt lại mật khẩu: ${resetUrl}`,
                        '',
                        'Liên kết có hiệu lực trong 15 phút.',
                        'Nếu không yêu cầu, hãy bỏ qua email này.',
                    ].join('\n'),
                }),
            },
        );

        if (!response.ok) {
            const errorBody = await response.text();

            this.logger.error(
                `Brevo API failed: ${response.status} - ${errorBody}`,
            );

            throw new InternalServerErrorException(
                'Không thể gửi email khôi phục mật khẩu',
            );
        }

        const result = (await response.json()) as {
            messageId?: string;
        };

        this.logger.log(
            `Brevo API accepted email. Message ID: ${result.messageId ?? 'N/A'}`,
        );
    }
}