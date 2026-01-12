import { DomainException } from '../../../../shared/domain';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';
import { Session } from './session.entity';

describe('Session', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const validProps = {
    movieId: 'movie-123',
    roomId: 'room-456',
    date: futureDate,
    timeSlot: TimeSlotEnum.SLOT_14_16,
  };

  describe('create', () => {
    it('should create a valid session', () => {
      const session = Session.create(validProps);

      expect(session.movieId).toBe('movie-123');
      expect(session.roomId).toBe('room-456');
      expect(session.timeSlot).toBe(TimeSlotEnum.SLOT_14_16);
      expect(session.id).toBeDefined();
    });

    it('should throw error for missing movie ID', () => {
      expect(() =>
        Session.create({
          ...validProps,
          movieId: '',
        }),
      ).toThrow(DomainException);
    });

    it('should throw error for missing room ID', () => {
      expect(() =>
        Session.create({
          ...validProps,
          roomId: '',
        }),
      ).toThrow(DomainException);
    });

    it('should throw error for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      expect(() =>
        Session.create({
          ...validProps,
          date: pastDate,
        }),
      ).toThrow(DomainException);
    });
  });

  describe('timeSlotLabel', () => {
    it('should return human readable time slot', () => {
      const session = Session.create(validProps);

      expect(session.timeSlotLabel).toBe('14:00-16:00');
    });
  });

  describe('isPast', () => {
    it('should return false for future session', () => {
      const session = Session.create(validProps);

      expect(session.isPast()).toBe(false);
    });
  });

  describe('conflictsWith', () => {
    it('should return true for conflicting sessions', () => {
      const session1 = Session.create(validProps);

      const session2 = Session.create({
        ...validProps,
        movieId: 'movie-789', // different movie, same room/time
      });

      expect(session1.conflictsWith(session2)).toBe(true);
    });

    it('should return false for different time slots', () => {
      const session1 = Session.create(validProps);

      const session2 = Session.create({
        ...validProps,
        timeSlot: TimeSlotEnum.SLOT_16_18,
      });

      expect(session1.conflictsWith(session2)).toBe(false);
    });

    it('should return false for different rooms', () => {
      const session1 = Session.create(validProps);

      const session2 = Session.create({
        ...validProps,
        roomId: 'room-different',
      });

      expect(session1.conflictsWith(session2)).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute session from persistence', () => {
      const id = 'session-id';
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const session = Session.reconstitute(id, {
        movieId: 'movie-123',
        roomId: 'room-456',
        date: futureDate,
        timeSlot: TimeSlotEnum.SLOT_14_16,
        createdAt,
        updatedAt,
      });

      expect(session.id).toBe(id);
      expect(session.movieId).toBe('movie-123');
      expect(session.roomId).toBe('room-456');
      expect(session.createdAt).toBe(createdAt);
    });
  });
});
