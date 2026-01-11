import { DomainException } from '../../../../shared/domain';
import { Movie } from './movie.entity';

describe('Movie', () => {
  describe('create', () => {
    it('should create a valid movie', () => {
      const movie = Movie.create({
        title: 'Inception',
        description: 'A mind-bending thriller',
        ageRestriction: 13,
      });

      expect(movie.title).toBe('Inception');
      expect(movie.description).toBe('A mind-bending thriller');
      expect(movie.ageRestriction).toBe(13);
      expect(movie.id).toBeDefined();
    });

    it('should create movie with default age restriction', () => {
      const movie = Movie.create({
        title: 'Finding Nemo',
      });

      expect(movie.ageRestriction).toBe(0);
    });

    it('should throw error for empty title', () => {
      expect(() => Movie.create({ title: '' })).toThrow(DomainException);
    });

    it('should throw error for whitespace-only title', () => {
      expect(() => Movie.create({ title: '   ' })).toThrow(DomainException);
    });
  });

  describe('update', () => {
    it('should update movie title', () => {
      const movie = Movie.create({ title: 'Original' });
      const updated = movie.update({ title: 'Updated' });

      expect(updated.title).toBe('Updated');
      expect(updated.id).toBe(movie.id);
    });

    it('should update movie description', () => {
      const movie = Movie.create({ title: 'Test', description: 'Original' });
      const updated = movie.update({ description: 'Updated description' });

      expect(updated.description).toBe('Updated description');
    });

    it('should update age restriction', () => {
      const movie = Movie.create({ title: 'Test', ageRestriction: 0 });
      const updated = movie.update({ ageRestriction: 18 });

      expect(updated.ageRestriction).toBe(18);
    });

    it('should throw error for invalid title on update', () => {
      const movie = Movie.create({ title: 'Test' });
      expect(() => movie.update({ title: '' })).toThrow(DomainException);
    });
  });

  describe('canBeWatchedBy', () => {
    it('should return true when user age meets restriction', () => {
      const movie = Movie.create({ title: 'Test', ageRestriction: 18 });
      expect(movie.canBeWatchedBy(18)).toBe(true);
    });

    it('should return true when user age exceeds restriction', () => {
      const movie = Movie.create({ title: 'Test', ageRestriction: 18 });
      expect(movie.canBeWatchedBy(25)).toBe(true);
    });

    it('should return false when user age is below restriction', () => {
      const movie = Movie.create({ title: 'Test', ageRestriction: 18 });
      expect(movie.canBeWatchedBy(16)).toBe(false);
    });

    it('should return true for all ages when no restriction', () => {
      const movie = Movie.create({ title: 'Test' });
      expect(movie.canBeWatchedBy(5)).toBe(true);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute movie from persistence', () => {
      const id = 'test-id';
      const movie = Movie.reconstitute(id, {
        title: 'Test',
        description: 'Description',
        ageRestriction: 13,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(movie.id).toBe(id);
      expect(movie.title).toBe('Test');
    });
  });
});
