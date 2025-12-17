import { Redis} from 'ioredis';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

/**
 * I probably wont have time to fully implement caching for all queries,
 * but this is a basic wrapper to cache query results in Redis.
 * The idea is to cache frequently requested data to reduce DB load.
 * And for invalidation, we can set TTLs or implement cache busting on updates.
 * @param originalQuery
 * @param args 
 * @returns 
 */
export async function wrapClientQuery<T>(originalQuery: (...args: never[]) => Promise<never>, ...args: never[]) {
  const cacheKey = JSON.stringify(args);
  try {
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      logger.debug('Cache hit', { cacheKey });
      return JSON.parse(cachedResult) as T;
    }

    const result = await originalQuery(...args);
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    logger.debug('Cache miss - storing result', { cacheKey });
    return result as T;
  } catch (error) {
    logger.error('Redis error, proceeding without cache', { error });
    return originalQuery(...args) as T;
  }
}

export async function set(key: string, value: string): Promise<void> {
    try {
        await redis.set(key, value);
    } catch (error) {
        logger.error('Error setting key in cache', { error });
    }
}

export async function get(key: string): Promise<string | null> {
    try {
        return await redis.get(key);
    } catch (error) {
        logger.error('Error getting key from cache', { error });
        return null;
    }
}

export async function setVersionInCache(index: string, version: string): Promise<void> {
    try {
        await redis.set(`version:${index}`, version);
    } catch (error) {
        logger.error('Error setting version in cache', { error });
    }
}

export async function getVersionFromCache(index: string): Promise<string | null> {
    try {
        const version = await redis.get(`version:${index}`);

        if (!version) {
            await setVersionInCache(index, '1');
            return '1';
        }

        return version;
    } catch (error) {
        logger.error('Error fetching version from cache', { error });
        return null;
    }
}

redis.on('connect', () => {
  logger.info('Redis client connected');
});

redis.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redis.on('ready', () => {
  logger.info('Redis client ready to accept commands');
});

export { redis };
