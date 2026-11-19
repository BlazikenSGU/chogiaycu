
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;

  constructor(private readonly config: ConfigService) {
    const apiKey =
      this.config.getOrThrow<string>('RESEND_API_KEY');

    this.resend = new Resend(apiKey);
  }

  async sendResetPasswordEmail(
    to: string,
    resetUrl: string,
  ): Promise<void> {
    const from = this.config.getOrThrow<string>(
      'RESEND_FROM',
    );

    const testEmail = this.config.getOrThrow<string>(
      'RESEND_TEST_EMAIL',
    );

    // Chỉ áp dụng khi chưa xác minh domain riêng.
    if (to.trim().toLowerCase() !== testEmail.trim().toLowerCase()) {
      this.logger.warn(
        'Recipient is not allowed in Resend testing mode',
      );

      throw new InternalServerErrorException(
        'Email service is in testing mode',
      );
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from,
        to: [to],
        subject: '72Market - Đặt lại mật khẩu',
        text: [
          'Bạn đã yêu cầu đặt lại mật khẩu 72Market.',
          '',
          `Đặt lại mật khẩu: ${resetUrl}`,
          '',
          'Liên kết có hiệu lực trong 15 phút.',
          'Nếu không yêu cầu, hãy bỏ qua email này.',
        ].join('\n'),
      });

      if (error) {
        this.logger.error(
          `Resend error: ${error.name} - ${error.message}`,
        );

        throw new InternalServerErrorException(
          'Không thể gửi email khôi phục mật khẩu',
        );
      }

      this.logger.log(
        `Resend accepted email. ID: ${data?.id ?? 'N/A'}`,
      );
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      this.logger.error(
        'Unexpected error while sending email',
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Không thể gửi email khôi phục mật khẩu',
      );
    }
  }
}
