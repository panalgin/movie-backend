import { DomainErrorCode } from '../../../../shared/domain';
import { Room } from './room.entity';

describe('Room', () => {
  describe('create', () => {
    it('should create a valid room with default capacity', () => {
      const room = Room.create({ number: 1 });

      expect(room.number).toBe(1);
      expect(room.capacity).toBe(50);
      expect(room.id).toBeDefined();
      expect(room.createdAt).toBeDefined();
    });

    it('should create a room with custom capacity', () => {
      const room = Room.create({ number: 5, capacity: 100 });

      expect(room.number).toBe(5);
      expect(room.capacity).toBe(100);
    });

    it('should throw error for invalid room number', () => {
      expect(() => Room.create({ number: 0 })).toThrow(
        expect.objectContaining({ code: DomainErrorCode.INVALID_ROOM_NUMBER }),
      );
      expect(() => Room.create({ number: -1 })).toThrow(
        expect.objectContaining({ code: DomainErrorCode.INVALID_ROOM_NUMBER }),
      );
    });

    it('should throw error for invalid capacity', () => {
      expect(() => Room.create({ number: 1, capacity: 0 })).toThrow(
        expect.objectContaining({
          code: DomainErrorCode.INVALID_ROOM_CAPACITY,
        }),
      );
      expect(() => Room.create({ number: 1, capacity: -1 })).toThrow(
        expect.objectContaining({
          code: DomainErrorCode.INVALID_ROOM_CAPACITY,
        }),
      );
    });
  });

  describe('hasCapacityFor', () => {
    it('should return true when tickets are less than capacity', () => {
      const room = Room.create({ number: 1, capacity: 50 });

      expect(room.hasCapacityFor(0)).toBe(true);
      expect(room.hasCapacityFor(49)).toBe(true);
    });

    it('should return false when tickets equal or exceed capacity', () => {
      const room = Room.create({ number: 1, capacity: 50 });

      expect(room.hasCapacityFor(50)).toBe(false);
      expect(room.hasCapacityFor(51)).toBe(false);
    });
  });

  describe('remainingCapacity', () => {
    it('should calculate remaining capacity correctly', () => {
      const room = Room.create({ number: 1, capacity: 50 });

      expect(room.remainingCapacity(0)).toBe(50);
      expect(room.remainingCapacity(30)).toBe(20);
      expect(room.remainingCapacity(50)).toBe(0);
    });

    it('should return 0 when over capacity', () => {
      const room = Room.create({ number: 1, capacity: 50 });

      expect(room.remainingCapacity(60)).toBe(0);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute room from persistence', () => {
      const id = 'room-id';
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const room = Room.reconstitute(id, {
        number: 3,
        capacity: 75,
        createdAt,
        updatedAt,
      });

      expect(room.id).toBe(id);
      expect(room.number).toBe(3);
      expect(room.capacity).toBe(75);
      expect(room.createdAt).toBe(createdAt);
      expect(room.updatedAt).toBe(updatedAt);
    });
  });
});
