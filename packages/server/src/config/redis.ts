import { createClient } from 'redis';

export function createRedisClient(url: string) {
  return createClient({ url });
}
