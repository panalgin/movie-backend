import { DomainException } from '../../../../shared/domain';
import { WatchHistory } from './watch-history.entity';

describe('WatchHistory', () => {
  describe('create', () => {
    it('should create a valid watch history entry', () => {
      const watchHistory = WatchHistory.create({
        userId: 'user-123',
        movieId: 'movie-456',
      });

      expect(watchHistory.userId).toBe('user-123');
      expect(watchHistory.movieId).toBe('movie-456');
      expect(watchHistory.watchedAt).toBeDefined();
      expect(watchHistory.id).toBeDefined();
    });

    it('should throw error for missing user ID', () => {
      expect(() =>
        WatchHistory.create({
          userId: '',
          movieId: 'movie-456',
        }),
      ).toThrow(DomainException);
    });

    it('should throw error for missing movie ID', () => {
      expect(() =>
        WatchHistory.create({
          userId: 'user-123',
          movieId: '',
        }),
      ).toThrow(DomainException);
    });
  });

  describe('belongsTo', () => {
    it('should return true for matching user', () => {
      const watchHistory = WatchHistory.create({
        userId: 'user-123',
        movieId: 'movie-456',
      });

      expect(watchHistory.belongsTo('user-123')).toBe(true);
    });

    it('should return false for different user', () => {
      const watchHistory = WatchHistory.create({
        userId: 'user-123',
        movieId: 'movie-456',
      });

      expect(watchHistory.belongsTo('user-789')).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute watch history from persistence', () => {
      const id = 'history-id';
      const watchedAt = new Date();
      const watchHistory = WatchHistory.reconstitute(id, {
        userId: 'user-123',
        movieId: 'movie-456',
        watchedAt,
      });

      expect(watchHistory.id).toBe(id);
      expect(watchHistory.userId).toBe('user-123');
      expect(watchHistory.watchedAt).toBe(watchedAt);
    });
  });
});
