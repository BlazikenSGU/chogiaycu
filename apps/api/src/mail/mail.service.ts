
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


  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
    idempotencyKey?: string,
  ): Promise<void> {
    const from = this.config.getOrThrow<string>('RESEND_FROM');

    try {
      const { data, error } = await this.resend.emails.send(
        { from, to: [to], subject, html, text },
        idempotencyKey ? { idempotencyKey } : undefined,
      );

      if (error) {
        this.logger.error(
          `Resend error: ${error.name} - ${error.message}`,
        );

        throw new InternalServerErrorException(
          'Không thể gửi email',
        );
      }

      this.logger.log(
        `Resend accepted email. ID: ${data?.id ?? 'N/A'}`,
      );
    } catch (error) {
      this.logger.error(
        `Send email failed: ${error instanceof Error
          ? error.message
          : 'Unknown error'
        }`,
      );

      throw new InternalServerErrorException(
        'Không thể gửi email',
      );
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private template(
    title: string,
    content: string,
    buttonText: string,
    buttonUrl: string,
  ): string {
    const safeUrl = this.escapeHtml(buttonUrl);

    return `
      <div style="background:#f4f4f5;padding:24px;
        font-family:Arial,sans-serif;color:#18181b">

        <div style="max-width:560px;margin:auto;
          background:#fff;padding:32px;
          border-radius:12px">

          <h1 style="color:#15803d;text-align:center">
            72Market
          </h1>

          <hr style="border:0;border-top:1px solid #eee">

          <h2>${title}</h2>

          ${content}

          <div style="text-align:center;margin:32px 0">
            <a href="${safeUrl}"
              style="background:#15803d;color:#fff;
              padding:14px 24px;border-radius:8px;
              text-decoration:none;display:inline-block">
              ${buttonText}
            </a>
          </div>

          <p style="font-size:12px;word-break:break-all">
            Nếu nút không hoạt động, hãy mở liên kết:
            <br>${safeUrl}
          </p>

          <hr style="border:0;border-top:1px solid #eee">

          <p style="font-size:12px;color:#71717a;
            text-align:center">
            © ${new Date().getFullYear()} 72Market<br>
            72market.shop<br>
            Email được gửi tự động từ hệ thống.
          </p>
        </div>
      </div>
    `;
  }

  async sendResetPasswordEmail(
    to: string,
    resetUrl: string,
  ): Promise<void> {
    await this.sendEmail(
      to,
      '72Market - Đặt lại mật khẩu',
      this.template(
        'Đặt lại mật khẩu',
        `<p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
         <p>Liên kết có hiệu lực trong 15 phút.</p>
         <p>Nếu không yêu cầu, hãy bỏ qua email này.</p>`,
        'Đặt lại mật khẩu',
        resetUrl,
      ),
      `Đặt lại mật khẩu: ${resetUrl}\n` +
      'Liên kết có hiệu lực trong 15 phút.',
    );
  }

  async sendVerificationEmail(
    to: string,
    verifyUrl: string,
  ): Promise<void> {
    await this.sendEmail(
      to,
      '72Market - Xác thực tài khoản',
      this.template(
        'Xác thực địa chỉ email',
        `<p>Cảm ơn bạn đã đăng ký tại 72Market.</p>
         <p>Vui lòng xác thực email để kích hoạt tài khoản.</p>
         <p>Liên kết có hiệu lực trong 15 phút.</p>
         <p>Nếu không đăng ký, hãy bỏ qua email này.</p>`,
        'Xác thực tài khoản',
        verifyUrl,
      ),
      `Xác thực tài khoản: ${verifyUrl}\n` +
      'Liên kết có hiệu lực trong 15 phút.',
    );
  }

  async sendWelcomeEmail(
    to: string,
    userId: string,
  ): Promise<void> {
    const frontendUrl =
      this.config.getOrThrow<string>('FRONTEND_URL');

    await this.sendEmail(
      to,
      'Chào mừng bạn đến với 72Market!',
      this.template(
        'Chào mừng đến với 72Market!',
        `<p>Tài khoản của bạn đã được xác thực thành công.</p>
         <p>Hãy bắt đầu khám phá các sản phẩm và
         đăng bán những đôi giày của bạn.</p>
         <p>Cảm ơn bạn đã đồng hành cùng 72Market!</p>`,
        'Khám phá 72Market',
        frontendUrl,
      ),
      `Chào mừng bạn đến với 72Market!\n${frontendUrl}`,
      `welcome-${userId}`,
    );
  }
}
