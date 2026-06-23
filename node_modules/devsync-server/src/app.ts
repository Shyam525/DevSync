// import express from "express"; const app = express(); export default app;


import express, { Application } from 'express';
import { env } from './config/env';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { logger } from './logger';
import { healthRouter } from './health/health.routes';

const app: Application = express();

// ─── Middleware ────────────────────────────────────────────────────────────
// Parse JSON request bodies — without this, req.body is undefined
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ─── Routes ────────────────────────────────────────────────────────────────
// Mount the health router at /health
// Any request to /health/... is handled by healthRouter
app.use('/health', healthRouter);

// ─── Startup Function ──────────────────────────────────────────────────────
const startServer = async (): Promise<void> => {
  // Step 1: Connect to databases BEFORE accepting any requests
  // Order matters: connect dependencies, then start listening
  await connectDB();
  await connectRedis();

  // Step 2: Start listening for HTTP requests
  app.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode`);
    logger.info(`Port: ${env.PORT}`);
    logger.info(`Health check: http://localhost:${env.PORT}/health`);
  });
};

// ─── Graceful Shutdown ─────────────────────────────────────────────────────
// When the process receives SIGINT (Ctrl+C) or SIGTERM (Docker stop),
// log the shutdown instead of just dying silently
process.on('SIGINT', () => {
  logger.info('Received SIGINT — shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM — shutting down gracefully');
  process.exit(0);
});

// ─── Start ─────────────────────────────────────────────────────────────────
startServer().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});

// Export app for testing (Supertest imports this in Week 9)
export { app };