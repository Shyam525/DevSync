import express, { Application, Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { logger } from './logger';

import { healthRouter } from './health/health.routes';
import { apiV1Router } from './api/v1/index';
import { initSocket } from './socket';

import { requestId } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';
import { generalRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestId);
app.use(requestLogger);
app.use(generalRateLimiter);

app.use('/health', healthRouter);
app.use('/api/v1', apiV1Router);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { message: `Cannot ${req.method} ${req.url} — route not found` },
  });
});

app.use(errorHandler);

// ─── NEW THIS WEEK ─────────────────────────────────────────────────────
// http.createServer(app) wraps the Express app in a raw Node server.
// Socket.IO attaches to THIS object, hooking into the same TCP
// connection Express uses, upgrading specific requests to WebSocket
// connections while leaving normal HTTP requests to Express as before.
const httpServer = http.createServer(app);
const io = initSocket(httpServer);

const startServer = async (): Promise<void> => {
  await connectDB();
  await connectRedis();

  // NOTICE: httpServer.listen(), NOT app.listen(). app.listen() would
  // create its OWN internal http.Server — a second one, invisible to
  // Socket.IO, which needs to attach to this exact instance.
  httpServer.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info('Socket.IO ready');
  });
};

process.on('SIGINT', () => { logger.info('Shutting down...'); process.exit(0); });
process.on('SIGTERM', () => { logger.info('Shutting down...'); process.exit(0); });

startServer().catch((err) => {
  logger.error({ err }, 'Server failed to start');
  process.exit(1);
});

export { app, io };