import { DomainException } from '../../../../shared/domain';
import { Ticket } from './ticket.entity';

describe('Ticket', () => {
  describe('create', () => {
    it('should create a valid ticket', () => {
      const ticket = Ticket.create({
        userId: 'user-123',
        sessionId: 'session-456',
      });

      expect(ticket.userId).toBe('user-123');
      expect(ticket.sessionId).toBe('session-456');
      expect(ticket.purchasedAt).toBeDefined();
      expect(ticket.id).toBeDefined();
    });

    it('should throw error for missing user ID', () => {
      expect(() =>
        Ticket.create({
          userId: '',
          sessionId: 'session-456',
        }),
      ).toThrow(DomainException);
    });

    it('should throw error for missing session ID', () => {
      expect(() =>
        Ticket.create({
          userId: 'user-123',
          sessionId: '',
        }),
      ).toThrow(DomainException);
    });
  });

  describe('belongsTo', () => {
    it('should return true for matching user', () => {
      const ticket = Ticket.create({
        userId: 'user-123',
        sessionId: 'session-456',
      });

      expect(ticket.belongsTo('user-123')).toBe(true);
    });

    it('should return false for different user', () => {
      const ticket = Ticket.create({
        userId: 'user-123',
        sessionId: 'session-456',
      });

      expect(ticket.belongsTo('user-789')).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute ticket from persistence', () => {
      const id = 'ticket-id';
      const purchasedAt = new Date();
      const ticket = Ticket.reconstitute(id, {
        userId: 'user-123',
        sessionId: 'session-456',
        purchasedAt,
      });

      expect(ticket.id).toBe(id);
      expect(ticket.userId).toBe('user-123');
      expect(ticket.purchasedAt).toBe(purchasedAt);
    });
  });
});
