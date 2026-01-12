import type { NotificationChannel } from '../enums';

export const NOTIFICATION_PROVIDERS = Symbol('NOTIFICATION_PROVIDERS');

export interface INotificationProvider {
  readonly channel: NotificationChannel;

  /**
   * Check if the provider is properly configured (has API keys, etc.)
   */
  isConfigured(): boolean;

  /**
   * Send a notification
   * @returns true if sent successfully, false otherwise
   */
  send(to: string, subject: string, body: string): Promise<boolean>;
}
