import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationChannel, NotificationType } from '../domain/enums';
import type { INotificationProvider } from '../domain/interfaces';
import { NOTIFICATION_PROVIDERS } from '../domain/interfaces';
import {
  getTemplate,
  type NotificationData,
} from './templates/notification-templates';

export interface NotificationRecipient {
  email?: string;
  phone?: string;
}

export interface SendNotificationParams {
  type: NotificationType;
  channels: NotificationChannel[];
  recipient: NotificationRecipient;
  data: NotificationData;
}

export interface NotificationResult {
  channel: NotificationChannel;
  success: boolean;
  skipped: boolean;
  reason?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly providerMap: Map<NotificationChannel, INotificationProvider>;

  constructor(
    @Inject(NOTIFICATION_PROVIDERS)
    providers: INotificationProvider[],
  ) {
    this.providerMap = new Map();
    for (const provider of providers) {
      this.providerMap.set(provider.channel, provider);
    }

    this.logger.log(
      `Notification service initialized with ${providers.length} providers`,
    );
  }

  async send(params: SendNotificationParams): Promise<NotificationResult[]> {
    const { type, channels, recipient, data } = params;
    const template = getTemplate(type, data);
    const results: NotificationResult[] = [];

    for (const channel of channels) {
      const provider = this.providerMap.get(channel);

      if (!provider) {
        results.push({
          channel,
          success: false,
          skipped: true,
          reason: 'Provider not found',
        });
        continue;
      }

      if (!provider.isConfigured()) {
        results.push({
          channel,
          success: false,
          skipped: true,
          reason: 'Provider not configured',
        });
        continue;
      }

      const recipientAddress = this.getRecipientAddress(channel, recipient);
      if (!recipientAddress) {
        results.push({
          channel,
          success: false,
          skipped: true,
          reason: 'No recipient address for channel',
        });
        continue;
      }

      try {
        const success = await provider.send(
          recipientAddress,
          template.subject,
          template.body,
        );

        results.push({
          channel,
          success,
          skipped: false,
        });
      } catch (error) {
        this.logger.error(`Failed to send ${channel} notification`, error);
        results.push({
          channel,
          success: false,
          skipped: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  async sendEmail(
    to: string,
    type: NotificationType,
    data: NotificationData,
  ): Promise<boolean> {
    const results = await this.send({
      type,
      channels: [NotificationChannel.EMAIL],
      recipient: { email: to },
      data,
    });

    return results[0]?.success ?? false;
  }

  async sendSms(
    to: string,
    type: NotificationType,
    data: NotificationData,
  ): Promise<boolean> {
    const results = await this.send({
      type,
      channels: [NotificationChannel.SMS],
      recipient: { phone: to },
      data,
    });

    return results[0]?.success ?? false;
  }

  getConfiguredChannels(): NotificationChannel[] {
    return Array.from(this.providerMap.entries())
      .filter(([_, provider]) => provider.isConfigured())
      .map(([channel]) => channel);
  }

  private getRecipientAddress(
    channel: NotificationChannel,
    recipient: NotificationRecipient,
  ): string | undefined {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return recipient.email;
      case NotificationChannel.SMS:
        return recipient.phone;
      default:
        return undefined;
    }
  }
}
