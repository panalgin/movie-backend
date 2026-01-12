import { DomainErrorCode } from '../../../../shared/domain';
import { UserAge } from './user-age.vo';

describe('UserAge', () => {
  describe('create', () => {
    it('should create a valid user age', () => {
      const userAge = UserAge.create(25);
      expect(userAge.value).toBe(25);
    });

    it('should throw an error for non-integer age', () => {
      expect(() => UserAge.create(25.5)).toThrow(
        expect.objectContaining({ code: DomainErrorCode.INVALID_AGE }),
      );
    });

    it('should throw an error for age less than 1', () => {
      expect(() => UserAge.create(0)).toThrow(
        expect.objectContaining({ code: DomainErrorCode.INVALID_AGE }),
      );
    });

    it('should throw an error for age greater than 120', () => {
      expect(() => UserAge.create(121)).toThrow(
        expect.objectContaining({ code: DomainErrorCode.INVALID_AGE }),
      );
    });
  });

  describe('isAdult', () => {
    it('should return true for age 18', () => {
      const userAge = UserAge.create(18);
      expect(userAge.isAdult()).toBe(true);
    });

    it('should return true for age greater than 18', () => {
      const userAge = UserAge.create(25);
      expect(userAge.isAdult()).toBe(true);
    });

    it('should return false for age less than 18', () => {
      const userAge = UserAge.create(17);
      expect(userAge.isAdult()).toBe(false);
    });
  });

  describe('canWatch', () => {
    it('should return true when age meets restriction', () => {
      const userAge = UserAge.create(18);
      expect(userAge.canWatch(18)).toBe(true);
    });

    it('should return true when age exceeds restriction', () => {
      const userAge = UserAge.create(25);
      expect(userAge.canWatch(18)).toBe(true);
    });

    it('should return false when age does not meet restriction', () => {
      const userAge = UserAge.create(16);
      expect(userAge.canWatch(18)).toBe(false);
    });
  });
});
