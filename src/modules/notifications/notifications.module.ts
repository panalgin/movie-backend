import { Global, Module } from '@nestjs/common';
import { NotificationService } from './application';
import { NOTIFICATION_PROVIDERS } from './domain/interfaces';
import { SendGridProvider, TwilioProvider } from './infrastructure/providers';

@Global()
@Module({
  providers: [
    SendGridProvider,
    TwilioProvider,
    {
      provide: NOTIFICATION_PROVIDERS,
      useFactory: (sendgrid: SendGridProvider, twilio: TwilioProvider) => [
        sendgrid,
        twilio,
      ],
      inject: [SendGridProvider, TwilioProvider],
    },
    NotificationService,
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
