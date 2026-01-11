import { DomainException } from '../../../../shared/domain';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';
import { Session } from './session.entity';

describe('Session', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  describe('create', () => {
    it('should create a valid session', () => {
      const session = Session.create({
        movieId: 'movie-123',
        date: futureDate,
        timeSlot: TimeSlotEnum.SLOT_14_16,
        roomNumber: 1,
      });

      expect(session.movieId).toBe('movie-123');
      expect(session.timeSlot).toBe(TimeSlotEnum.SLOT_14_16);
      expect(session.roomNumber).toBe(1);
      expect(session.id).toBeDefined();
    });

    it('should throw error for missing movie ID', () => {
      expect(() =>
        Session.create({
          movieId: '',
          date: futureDate,
          timeSlot: TimeSlotEnum.SLOT_14_16,
          roomNumber: 1,
        }),
      ).toThrow(DomainException);
    });

    it('should throw error for invalid room number', () => {
      expect(() =>
        Session.create({
          movieId: 'movie-123',
          date: futureDate,
          timeSlot: TimeSlotEnum.SLOT_14_16,
          roomNumber: 0,
        }),
      ).toThrow(DomainException);
    });

    it('should throw error for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      expect(() =>
        Session.create({
          movieId: 'movie-123',
          date: pastDate,
          timeSlot: TimeSlotEnum.SLOT_14_16,
          roomNumber: 1,
        }),
      ).toThrow(DomainException);
    });
  });

  describe('timeSlotLabel', () => {
    it('should return human readable time slot', () => {
      const session = Session.create({
        movieId: 'movie-123',
        date: futureDate,
        timeSlot: TimeSlotEnum.SLOT_14_16,
        roomNumber: 1,
      });

      expect(session.timeSlotLabel).toBe('14:00-16:00');
    });
  });

  describe('isPast', () => {
    it('should return false for future session', () => {
      const session = Session.create({
        movieId: 'movie-123',
        date: futureDate,
        timeSlot: TimeSlotEnum.SLOT_14_16,
        roomNumber: 1,
      });

      expect(session.isPast()).toBe(false);
    });
  });

  describe('conflictsWith', () => {
    it('should return true for conflicting sessions', () => {
      const session1 = Session.create({
        movieId: 'movie-123',
        date: futureDate,
        timeSlot: TimeSlotEnum.SLOT_14_16,
        roomNumber: 1,
      });

      const session2 = Session.create({
        movieId: 'movie-456',
        date: futureDate,
        timeSlot: TimeSlotEnum.SLOT_14_16,
        roomNumber: 1,
      });

      expect(session1.conflictsWith(session2)).toBe(true);
    });

    it('should return false for different time slots', () => {
      const session1 = Session.create({
        movieId: 'movie-123',
        date: futureDate,
        timeSlot: TimeSlotEnum.SLOT_14_16,
        roomNumber: 1,
      });

      const session2 = Session.create({
        movieId: 'movie-456',
        date: futureDate,
        timeSlot: TimeSlotEnum.SLOT_16_18,
        roomNumber: 1,
      });

      expect(session1.conflictsWith(session2)).toBe(false);
    });

    it('should return false for different rooms', () => {
      const session1 = Session.create({
        movieId: 'movie-123',
        date: futureDate,
        timeSlot: TimeSlotEnum.SLOT_14_16,
        roomNumber: 1,
      });

      const session2 = Session.create({
        movieId: 'movie-456',
        date: futureDate,
        timeSlot: TimeSlotEnum.SLOT_14_16,
        roomNumber: 2,
      });

      expect(session1.conflictsWith(session2)).toBe(false);
    });
  });
});
