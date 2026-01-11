import { DomainException } from '../../../../shared/domain';
import { TimeSlot, TimeSlotEnum } from './time-slot.vo';

describe('TimeSlot', () => {
  describe('create', () => {
    it('should create a valid time slot', () => {
      const timeSlot = TimeSlot.create(TimeSlotEnum.SLOT_10_12);
      expect(timeSlot.value).toBe(TimeSlotEnum.SLOT_10_12);
      expect(timeSlot.label).toBe('10:00-12:00');
    });

    it('should throw an error for invalid time slot', () => {
      expect(() => TimeSlot.create('INVALID' as TimeSlotEnum)).toThrow(
        DomainException,
      );
    });
  });

  describe('fromString', () => {
    it('should create time slot from valid string', () => {
      const timeSlot = TimeSlot.fromString('SLOT_14_16');
      expect(timeSlot.value).toBe(TimeSlotEnum.SLOT_14_16);
    });

    it('should throw an error for invalid string', () => {
      expect(() => TimeSlot.fromString('INVALID')).toThrow(DomainException);
    });
  });

  describe('getAllSlots', () => {
    it('should return all 7 time slots', () => {
      const slots = TimeSlot.getAllSlots();
      expect(slots).toHaveLength(7);
    });
  });

  describe('toString', () => {
    it('should return the label', () => {
      const timeSlot = TimeSlot.create(TimeSlotEnum.SLOT_22_00);
      expect(timeSlot.toString()).toBe('22:00-00:00');
    });
  });

  describe('equals', () => {
    it('should return true for equal time slots', () => {
      const slot1 = TimeSlot.create(TimeSlotEnum.SLOT_10_12);
      const slot2 = TimeSlot.create(TimeSlotEnum.SLOT_10_12);
      expect(slot1.equals(slot2)).toBe(true);
    });

    it('should return false for different time slots', () => {
      const slot1 = TimeSlot.create(TimeSlotEnum.SLOT_10_12);
      const slot2 = TimeSlot.create(TimeSlotEnum.SLOT_12_14);
      expect(slot1.equals(slot2)).toBe(false);
    });
  });
});
