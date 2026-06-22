// import { createClient } from 'redis';

// export function createRedisClient(url: string) {
//   return createClient({ url });
// }


import Redis from 'ioredis';
import { logger } from '../logger';
import { env } from './env';

// Create the Redis client — lazyConnect means it does NOT connect immediately
// We call .connect() explicitly in app.ts during startup
export const redisClient = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,      // Retry failed commands up to 3 times
  enableReadyCheck: true,       // Wait until Redis is fully ready before resolving
});

// Event listeners for observability
redisClient.on('connect', () => logger.info('Redis connected'));
redisClient.on('ready', () => logger.info('Redis ready'));
redisClient.on('error', (err) => logger.error({ err }, 'Redis error'));
redisClient.on('close', () => logger.warn('Redis connection closed'));
redisClient.on('reconnecting', () => logger.info('Redis reconnecting...'));

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error({ error }, 'Redis connection failed');
    process.exit(1);
  }
};