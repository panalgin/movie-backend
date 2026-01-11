import { DomainException } from '../../../../shared/domain';
import { AgeRestriction } from './age-restriction.vo';

describe('AgeRestriction', () => {
  describe('create', () => {
    it('should create a valid age restriction', () => {
      const ageRestriction = AgeRestriction.create(18);
      expect(ageRestriction.value).toBe(18);
    });

    it('should throw an error for negative age restriction', () => {
      expect(() => AgeRestriction.create(-1)).toThrow(DomainException);
    });

    it('should throw an error for age restriction over 21', () => {
      expect(() => AgeRestriction.create(22)).toThrow(DomainException);
    });
  });

  describe('none', () => {
    it('should create age restriction with value 0', () => {
      const ageRestriction = AgeRestriction.none();
      expect(ageRestriction.value).toBe(0);
    });
  });

  describe('allowsAge', () => {
    it('should allow user age equal to restriction', () => {
      const ageRestriction = AgeRestriction.create(18);
      expect(ageRestriction.allowsAge(18)).toBe(true);
    });

    it('should allow user age greater than restriction', () => {
      const ageRestriction = AgeRestriction.create(18);
      expect(ageRestriction.allowsAge(25)).toBe(true);
    });

    it('should not allow user age less than restriction', () => {
      const ageRestriction = AgeRestriction.create(18);
      expect(ageRestriction.allowsAge(16)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return "All ages" for 0', () => {
      const ageRestriction = AgeRestriction.none();
      expect(ageRestriction.toString()).toBe('All ages');
    });

    it('should return formatted string for non-zero', () => {
      const ageRestriction = AgeRestriction.create(18);
      expect(ageRestriction.toString()).toBe('18+');
    });
  });
});
