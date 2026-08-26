// export const placeholder = () => {};


import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { logger } from '../logger';
import { env } from '../config/env';

// ─── WHY THIS MIDDLEWARE EXISTS ───────────────────────────────────────────
//
// Every error thrown anywhere in the app arrives here.
// This is the single place where errors become HTTP responses.
//
// Express identifies this as an error handler because it has 4 parameters.
// Normal middleware: (req, res, next) — 3 parameters
// Error middleware: (err, req, res, next) — 4 parameters (err is first)
//
// This file makes TWO critical decisions:
//
// Decision 1: What HTTP status code to send?
//   AppError → use err.statusCode (401, 403, 404, 422, etc.)
//   Unknown error → 500 (something unexpected broke)
//
// Decision 2: What error message to show the user?
//   Operational error (isOperational: true) → show the real message
//   Programmer error (isOperational: false) → show generic message
//
// WHY hide programmer errors?
// Stack traces and internal error messages can expose:
// - Your database schema structure
// - Your file system paths
// - Which third-party libraries you use
// - Bugs that attackers can exploit
// Always show generic messages for unexpected errors.

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction        // Required by Express even if unused
): void => {
  // Check if this is one of OUR custom errors or an unexpected system error
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? (err as AppError).statusCode : 500;
  const isOperational = isAppError ? (err as AppError).isOperational : false;

  // Log the error with full context for debugging
  // Include requestId so you can trace this error back to specific request logs
  const logContext = {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    statusCode,
    errorName: err.name,
    errorMessage: err.message,
    userId: req.user?.userId,
    // Only include stack trace in logs — NEVER in the response
    stack: err.stack,
  };

  // 500 errors are bugs — log as ERROR (high severity alert)
  // 4xx errors are user mistakes — log as WARN (lower severity)
  if (statusCode >= 500) {
    logger.error(logContext, 'Unhandled server error');
  } else {
    logger.warn(logContext, 'Request error');
  }

  // ─── Send Response ────────────────────────────────────────────────────
  if (isOperational) {
    // Safe to show the real message — this is an expected error
    // User made a mistake (wrong password, missing field, not found, etc.)
    res.status(statusCode).json({
      success: false,
      error: {
        message: err.message,
        // In development: include stack trace to help debugging
        // In production: NEVER include stack trace
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  } else {
    // Unexpected error — hide internal details
    // But include requestId so user can report it and you can trace it
    res.status(500).json({
      success: false,
      error: {
        message: 'An unexpected error occurred. Please try again later.',
        requestId: req.requestId,
      },
    });
  }
};