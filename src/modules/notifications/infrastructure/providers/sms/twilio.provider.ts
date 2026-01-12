import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { NotificationChannel } from '../../../domain/enums';
import type { INotificationProvider } from '../../../domain/interfaces';

@Injectable()
export class TwilioProvider implements INotificationProvider {
  private readonly logger = new Logger(TwilioProvider.name);
  readonly channel = NotificationChannel.SMS;

  private readonly client: Twilio | null = null;
  private readonly fromNumber: string | undefined;
  private readonly isReady: boolean;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_FROM_NUMBER');

    if (accountSid && authToken && this.fromNumber) {
      this.client = new Twilio(accountSid, authToken);
      this.isReady = true;
      this.logger.log('Twilio provider initialized');
    } else {
      this.isReady = false;
      this.logger.warn(
        'Twilio credentials not configured - SMS notifications disabled',
      );
    }
  }

  isConfigured(): boolean {
    return this.isReady;
  }

  async send(to: string, _subject: string, body: string): Promise<boolean> {
    if (!this.isConfigured() || !this.client || !this.fromNumber) {
      this.logger.debug(`Twilio not configured, skipping SMS to ${to}`);
      return false;
    }

    try {
      await this.client.messages.create({
        body,
        from: this.fromNumber,
        to,
      });

      this.logger.log(`SMS sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}`, error);
      return false;
    }
  }
}
