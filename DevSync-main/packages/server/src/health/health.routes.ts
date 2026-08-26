// import { Router } from 'express';

// const router = Router();

// router.get('/health', (_req, res) => {
//   res.json({ status: 'ok', uptime: process.uptime() });
// });

// export default router;



import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../config/redis';

export const healthRouter = Router();

// GET /health — returns status of all dependencies
// This endpoint is called by Docker, Kubernetes, and monitoring tools
// to check if this service instance is healthy
healthRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  // mongoose.connection.readyState:
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbConnected = mongoose.connection.readyState === 1;

  let redisConnected = false;
  try {
    // PING → PONG means Redis is alive
    const pong = await redisClient.ping();
    redisConnected = pong === 'PONG';
  } catch {
    redisConnected = false;
  }

  // Overall status is OK only if ALL dependencies are connected
  const isHealthy = dbConnected && redisConnected;

  // 200 = OK, 503 = Service Unavailable (something is wrong)
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()) + 's',
    services: {
      database: dbConnected ? 'connected' : 'disconnected',
      redis: redisConnected ? 'connected' : 'disconnected',
    },
  });
});