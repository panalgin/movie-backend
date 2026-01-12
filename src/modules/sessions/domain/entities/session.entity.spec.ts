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

  describe('update', () => {
    it('should update session with new values', () => {
      const session = Session.create(validProps);
      const newFutureDate = new Date();
      newFutureDate.setDate(newFutureDate.getDate() + 14);

      const updated = session.update({
        roomId: 'new-room-id',
        date: newFutureDate,
        timeSlot: TimeSlotEnum.SLOT_18_20,
      });

      expect(updated.id).toBe(session.id);
      expect(updated.roomId).toBe('new-room-id');
      expect(updated.timeSlot).toBe(TimeSlotEnum.SLOT_18_20);
      expect(updated.movieId).toBe(session.movieId); // unchanged
    });

    it('should update session with partial values', () => {
      const session = Session.create(validProps);

      const updated = session.update({
        timeSlot: TimeSlotEnum.SLOT_20_22,
      });

      expect(updated.roomId).toBe(session.roomId);
      expect(updated.timeSlot).toBe(TimeSlotEnum.SLOT_20_22);
    });

    it('should throw error when updating to past date', () => {
      const session = Session.create(validProps);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      expect(() => session.update({ date: pastDate })).toThrow(DomainException);
      expect(() => session.update({ date: pastDate })).toThrow(
        'Session time cannot be in the past',
      );
    });

    it('should throw error when updating a past session', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const pastSession = Session.reconstitute('past-session-id', {
        movieId: 'movie-123',
        roomId: 'room-456',
        date: pastDate,
        timeSlot: TimeSlotEnum.SLOT_14_16,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => pastSession.update({ roomId: 'new-room' })).toThrow(
        DomainException,
      );
      expect(() => pastSession.update({ roomId: 'new-room' })).toThrow(
        'Cannot update a session that has already passed',
      );
    });
  });
});
