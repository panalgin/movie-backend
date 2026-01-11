import { DomainException } from '../../../../shared/domain';
import { User, UserRole } from './user.entity';

describe('User', () => {
  describe('create', () => {
    it('should create a valid user', () => {
      const user = User.create({
        username: 'john_doe',
        email: 'john@example.com',
        age: 25,
      });

      expect(user.username).toBe('john_doe');
      expect(user.email).toBe('john@example.com');
      expect(user.age).toBe(25);
      expect(user.role).toBe(UserRole.CUSTOMER);
      expect(user.id).toBeDefined();
    });

    it('should create a manager user', () => {
      const user = User.create({
        username: 'admin',
        email: 'admin@example.com',
        age: 30,
        role: UserRole.MANAGER,
      });

      expect(user.role).toBe(UserRole.MANAGER);
    });

    it('should throw error for short username', () => {
      expect(() =>
        User.create({
          username: 'ab',
          email: 'test@example.com',
          age: 25,
        }),
      ).toThrow(DomainException);
    });

    it('should throw error for invalid email', () => {
      expect(() =>
        User.create({
          username: 'john_doe',
          email: 'invalid-email',
          age: 25,
        }),
      ).toThrow(DomainException);
    });

    it('should normalize email to lowercase', () => {
      const user = User.create({
        username: 'john_doe',
        email: 'John@Example.COM',
        age: 25,
      });

      expect(user.email).toBe('john@example.com');
    });
  });

  describe('isManager', () => {
    it('should return true for manager', () => {
      const user = User.create({
        username: 'admin',
        email: 'admin@example.com',
        age: 30,
        role: UserRole.MANAGER,
      });

      expect(user.isManager()).toBe(true);
    });

    it('should return false for customer', () => {
      const user = User.create({
        username: 'john_doe',
        email: 'john@example.com',
        age: 25,
      });

      expect(user.isManager()).toBe(false);
    });
  });

  describe('isCustomer', () => {
    it('should return true for customer', () => {
      const user = User.create({
        username: 'john_doe',
        email: 'john@example.com',
        age: 25,
      });

      expect(user.isCustomer()).toBe(true);
    });

    it('should return false for manager', () => {
      const user = User.create({
        username: 'admin',
        email: 'admin@example.com',
        age: 30,
        role: UserRole.MANAGER,
      });

      expect(user.isCustomer()).toBe(false);
    });
  });

  describe('canWatchMovie', () => {
    it('should return true when age meets restriction', () => {
      const user = User.create({
        username: 'john_doe',
        email: 'john@example.com',
        age: 18,
      });

      expect(user.canWatchMovie(18)).toBe(true);
    });

    it('should return false when age below restriction', () => {
      const user = User.create({
        username: 'young_user',
        email: 'young@example.com',
        age: 16,
      });

      expect(user.canWatchMovie(18)).toBe(false);
    });
  });
});
