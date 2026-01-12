import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
      lazyConnect: true,
    });

    await this.client.connect();
    this.logger.log('Redis connected');
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis disconnected');
  }

  // ============ Cache Operations ============

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'PX', ttlMs);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // ============ Lock Operations ============

  /**
   * Try to acquire a lock with random jitter to prevent thundering herd
   */
  async tryLock(key: string, ttlMs = 5000, jitterMs = 100): Promise<boolean> {
    // Random jitter to spread out lock attempts
    if (jitterMs > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * jitterMs),
      );
    }

    const lockKey = `lock:${key}`;
    const result = await this.client.set(lockKey, '1', 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  async unlock(key: string): Promise<void> {
    const lockKey = `lock:${key}`;
    await this.client.del(lockKey);
  }

  // ============ Cache with Lock ============

  /**
   * Get cached value or compute it with lock protection
   * Only one request will compute, others wait for cache to be filled
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlMs: number,
    options?: {
      lockTtlMs?: number;
      jitterMs?: number;
      maxWaitMs?: number;
      retryIntervalMs?: number;
    },
  ): Promise<T> {
    const {
      lockTtlMs = 5000,
      jitterMs = 100,
      maxWaitMs = 1000,
      retryIntervalMs = 50,
    } = options ?? {};

    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - try to acquire lock with jitter
    const hasLock = await this.tryLock(key, lockTtlMs, jitterMs);

    if (hasLock) {
      try {
        // Double-check cache (another request might have filled it during jitter)
        const recheck = await this.get<T>(key);
        if (recheck !== null) {
          return recheck;
        }

        // Compute and cache the value
        const value = await factory();
        await this.set(key, value, ttlMs);
        return value;
      } finally {
        await this.unlock(key);
      }
    }

    // Couldn't get lock - poll cache until it's filled or timeout
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));

      const polled = await this.get<T>(key);
      if (polled !== null) {
        return polled;
      }
    }

    // Timeout - compute as fallback (rare edge case)
    return factory();
  }
}
