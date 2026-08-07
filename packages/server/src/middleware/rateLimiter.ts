import rateLimit from 'express-rate-limit';
import { AppError } from '../errors';

// ─── WHY THIS MIDDLEWARE EXISTS ───────────────────────────────────────────
//
// Without rate limiting, anyone can:
// - Try 1 million password combinations against /auth/login (brute force)
// - Flood /auth/register with fake accounts (spam)
// - Send 100,000 API requests to overload the server (DDoS)
//
// Rate limiting tracks requests per IP address.
// If an IP exceeds the limit → return 429 Too Many Requests.
//
// We have TWO limiters with DIFFERENT strictness:
//
// authRateLimiter (strict):
// - 10 requests per 15 minutes per IP
// - Applied to: /register, /login
// - Why: brute force attacks try thousands of passwords — this stops them
//
// generalRateLimiter (relaxed):
// - 100 requests per 15 minutes per IP
// - Applied to: all other routes
// - Why: legitimate users make many API calls — we just prevent flooding

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes in milliseconds
  max: 10,                    // Maximum 10 requests per window per IP

  // standardHeaders: true adds these headers to every response:
  // RateLimit-Limit: 10
  // RateLimit-Remaining: 7
  // RateLimit-Reset: 1234567890
  standardHeaders: true,
  legacyHeaders: false,

  // Custom handler: throw our AppError instead of default response
  // This means the error flows through our global errorHandler
  // so the response format is consistent with all other errors
  handler: (_req, _res, _next, options) => {
    throw new AppError(
      'Too many attempts. Please wait 15 minutes before trying again.',
      429
    );
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next, options) => {
    throw new AppError('Too many requests. Please slow down.', 429);
  },
});