import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

// ─── WHY THIS MIDDLEWARE EXISTS ───────────────────────────────────────────
//
// You need to know:
// - Which endpoint was called (method + url)
// - How long it took (duration)
// - Whether it succeeded or failed (statusCode)
// - Which user made the request (userId from JWT)
//
// This data is critical for:
// - Performance monitoring ("why is /api/v1/kanban slow?")
// - Debugging ("who called /api/v1/projects/delete right before the crash?")
// - Security auditing ("who is hitting /api/v1/auth/login 100 times per minute?")

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Record when the request arrived
  const startTime = Date.now();

  // We cannot log the response here because the route hasn't run yet.
  // Solution: listen to the 'finish' event on the response object.
  // 'finish' fires when the response has been completely sent to the client.
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const logData = {
      requestId: req.requestId,     // from requestId middleware
      method: req.method,           // GET, POST, PUT, DELETE
      url: req.url,                 // /api/v1/auth/login
      statusCode: res.statusCode,   // 200, 201, 400, 401, 404, 500
      duration: `${duration}ms`,    // How long the request took
      ip: req.ip,                   // Client IP address
      userId: req.user?.userId,     // If authenticated, who made the request
    };

    // Use different log levels based on response status
    // This makes filtering logs in production very easy:
    // - Search for ERROR level → server crashes and bugs
    // - Search for WARN level → client mistakes and auth failures
    // - Search for INFO level → normal successful traffic
    if (res.statusCode >= 500) {
      logger.error(logData, 'Request failed — server error');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'Request failed — client error');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  // Call next() BEFORE the response — the listener fires when response finishes
  next();
};