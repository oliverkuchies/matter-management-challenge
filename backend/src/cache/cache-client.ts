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
