import { NotificationType } from '../../domain/enums';

export interface TicketPurchasedData {
  movieTitle: string;
  sessionDate: string;
  timeSlot: string;
  roomNumber: number;
  ticketId: string;
}

export interface SessionCancelledData {
  movieTitle: string;
  sessionDate: string;
  timeSlot: string;
  roomNumber: number;
}

export interface WelcomeData {
  username: string;
}

export type NotificationData =
  | TicketPurchasedData
  | SessionCancelledData
  | WelcomeData;

export interface NotificationTemplate {
  subject: string;
  body: string;
}

export function getTemplate(
  type: NotificationType,
  data: NotificationData,
): NotificationTemplate {
  switch (type) {
    case NotificationType.TICKET_PURCHASED: {
      const d = data as TicketPurchasedData;
      return {
        subject: `Ticket Confirmation - ${d.movieTitle}`,
        body: `Your ticket has been confirmed!

Movie: ${d.movieTitle}
Date: ${d.sessionDate}
Time: ${d.timeSlot}
Room: ${d.roomNumber}
Ticket ID: ${d.ticketId}

Thank you for your purchase!`,
      };
    }

    case NotificationType.SESSION_CANCELLED: {
      const d = data as SessionCancelledData;
      return {
        subject: `Session Cancelled - ${d.movieTitle}`,
        body: `We're sorry to inform you that the following session has been cancelled:

Movie: ${d.movieTitle}
Date: ${d.sessionDate}
Time: ${d.timeSlot}
Room: ${d.roomNumber}

Please contact support for refund information.`,
      };
    }

    case NotificationType.SESSION_REMINDER: {
      const d = data as TicketPurchasedData;
      return {
        subject: `Reminder: ${d.movieTitle} - Today!`,
        body: `Don't forget! Your movie session is today:

Movie: ${d.movieTitle}
Time: ${d.timeSlot}
Room: ${d.roomNumber}

See you there!`,
      };
    }

    case NotificationType.WELCOME: {
      const d = data as WelcomeData;
      return {
        subject: 'Welcome to Movie Theatre!',
        body: `Hi ${d.username},

Welcome to Movie Theatre! We're excited to have you.

Browse our movies and book your first ticket today!

Best regards,
The Movie Theatre Team`,
      };
    }

    default:
      return {
        subject: 'Notification',
        body: 'You have a new notification.',
      };
  }
}
