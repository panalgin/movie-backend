import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { NotificationChannel } from '../../../domain/enums';
import type { INotificationProvider } from '../../../domain/interfaces';

@Injectable()
export class SendGridProvider implements INotificationProvider {
  private readonly logger = new Logger(SendGridProvider.name);
  readonly channel = NotificationChannel.EMAIL;

  private readonly apiKey: string | undefined;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail =
      this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
      'noreply@example.com';

    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
      this.logger.log('SendGrid provider initialized');
    } else {
      this.logger.warn(
        'SendGrid API key not configured - email notifications disabled',
      );
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async send(to: string, subject: string, body: string): Promise<boolean> {
    if (!this.isConfigured()) {
      this.logger.debug(`SendGrid not configured, skipping email to ${to}`);
      return false;
    }

    try {
      await sgMail.send({
        to,
        from: this.fromEmail,
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>'),
      });

      this.logger.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return false;
    }
  }
}
