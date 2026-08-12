// // import express from "express"; const app = express(); export default app;


// import express, { Application } from 'express';
// import { env } from './config/env';
// import { connectDB } from './config/db';
// import { connectRedis } from './config/redis';
// import { logger } from './logger';
// import { healthRouter } from './health/health.routes';

// const app: Application = express();

// // ─── Middleware ────────────────────────────────────────────────────────────
// // Parse JSON request bodies — without this, req.body is undefined
// app.use(express.json());

// // Parse URL-encoded form data
// app.use(express.urlencoded({ extended: true }));

// // ─── Routes ────────────────────────────────────────────────────────────────
// // Mount the health router at /health
// // Any request to /health/... is handled by healthRouter
// app.use('/health', healthRouter);

// // ─── Startup Function ──────────────────────────────────────────────────────
// const startServer = async (): Promise<void> => {
//   // Step 1: Connect to databases BEFORE accepting any requests
//   // Order matters: connect dependencies, then start listening
//   await connectDB();
//   await connectRedis();

//   // Step 2: Start listening for HTTP requests
//   app.listen(env.PORT, () => {
//     logger.info(`Server running in ${env.NODE_ENV} mode`);
//     logger.info(`Port: ${env.PORT}`);
//     logger.info(`Health check: http://localhost:${env.PORT}/health`);
//   });
// };

// // ─── Graceful Shutdown ─────────────────────────────────────────────────────
// // When the process receives SIGINT (Ctrl+C) or SIGTERM (Docker stop),
// // log the shutdown instead of just dying silently
// process.on('SIGINT', () => {
//   logger.info('Received SIGINT — shutting down gracefully');
//   process.exit(0);
// });

// process.on('SIGTERM', () => {
//   logger.info('Received SIGTERM — shutting down gracefully');
//   process.exit(0);
// });

// // ─── Start ─────────────────────────────────────────────────────────────────
// startServer().catch((error) => {
//   logger.error({ error }, 'Failed to start server');
//   process.exit(1);
// });

// // Export app for testing (Supertest imports this in Week 9)
// export { app };




import express, { Application, Request, Response } from 'express';
import { env } from './config/env';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { logger } from './logger';

// Routes
import { healthRouter } from './health/health.routes';
import { apiV1Router } from './api/v1/index';

// Middleware
import { requestId } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';
import { generalRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE CHAIN — ORDER IS CRITICAL. DO NOT REARRANGE.
// ═══════════════════════════════════════════════════════════════════════════

// 1. Body parsers — MUST be first. Without this, req.body is undefined.
//    validate() middleware reads req.body — it must come after this.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 2. Request ID — attach UUID to every request.
//    MUST be before requestLogger so log lines include the ID.
app.use(requestId);

// 3. Request logger — log every request with timing.
//    Reads req.requestId from step 2. Must come after requestId.
app.use(requestLogger);

// 4. General rate limiter — protect all routes from flooding.
//    Auth routes have their OWN stricter limiter applied per-route.
app.use(generalRateLimiter);

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Health check — no auth required. Monitoring tools need always access.
app.use('/health', healthRouter);

// All API routes under /api/v1
// Each route has its own middleware (authenticate, validate, etc.)
app.use('/api/v1', apiV1Router);

// ═══════════════════════════════════════════════════════════════════════════
// CATCH-ALL HANDLERS — MUST COME AFTER ALL ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// 404 — request didn't match any route above
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Cannot ${req.method} ${req.url} — route not found`,
    },
  });
});

// Global error handler — MUST BE LAST MIDDLEWARE.
// Express knows this is an error handler because it has 4 parameters.
// Every throw or next(error) call above reaches this function.
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════════════════

const startServer = async (): Promise<void> => {
  // Connect dependencies BEFORE accepting requests
  await connectDB();
  await connectRedis();

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`Health:  http://localhost:${env.PORT}/health`);
    logger.info(`Auth:    http://localhost:${env.PORT}/api/v1/auth`);
  });
};

process.on('SIGINT', () => { logger.info('Shutting down...'); process.exit(0); });
process.on('SIGTERM', () => { logger.info('Shutting down...'); process.exit(0); });

startServer().catch((err) => {
  logger.error({ err }, 'Server failed to start');
  process.exit(1);
});

export { app };