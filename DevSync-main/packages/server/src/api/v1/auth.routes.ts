// import { Router } from "express"; export const router = Router();



import { Router, Request, Response } from 'express';
import { authService } from '../../services/auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate';
import { authRateLimiter } from '../../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from '../../validations/auth.schema';
import { User } from '../../models/User';
import { NotFoundError } from '../../errors';

// ─── WHY A ROUTER? ────────────────────────────────────────────────────────
//
// Express Router is a mini-application — it groups related routes.
// We create one router per domain: auth, project, kanban, chat.
// Each router is mounted at a prefix in api/v1/index.ts.
//
// THIS FILE'S ONLY JOB:
// 1. Define the HTTP method and path
// 2. Chain middleware (rate limit → validate → authenticate → handler)
// 3. Call the service
// 4. Format and send the response
//
// ZERO business logic here. All logic is in auth.service.ts.

export const authRouter = Router();

// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────────────────────────────────
// Middleware chain for this route:
// 1. authRateLimiter → reject if IP has made too many requests
// 2. validate(registerSchema) → reject if body is invalid
// 3. asyncHandler(handler) → run the handler, catch any async errors

authRouter.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // req.body is already validated and transformed by validate() middleware
    // email is lowercase, strings are trimmed
    const { user, accessToken, refreshToken } = await authService.register(req.body);

    // 201 Created — resource was created successfully
    res.status(201).json({
      success: true,
      data: {
        user,           // User object (password removed by toJSON transform)
        accessToken,    // Short-lived (15 min) — use for API requests
        refreshToken,   // Long-lived (7 days) — use to get new access tokens
      },
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────────────────────────────────
authRouter.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { user, accessToken, refreshToken } = await authService.login(req.body);

    // 200 OK — authentication successful
    res.status(200).json({
      success: true,
      data: { user, accessToken, refreshToken },
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/refresh
// ─────────────────────────────────────────────────────────────────────────
// No rate limiter here — refresh requests are frequent and legitimate
// No authenticate middleware — user cannot authenticate if token expired

authRouter.post(
  '/refresh',
  validate(refreshSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────────────────────────────────
// authenticate runs first — only logged-in users can log out
// validate runs second — must provide the refresh token to revoke

authRouter.post(
  '/logout',
  authenticate,
  validate(refreshSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    // req.user is guaranteed to exist because authenticate ran first
    await authService.logout(req.user!.userId, refreshToken);

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  })
);

// ─────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// ─────────────────────────────────────────────────────────────────────────
// Returns the current user's profile
// Used by the frontend to get user data after app loads

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // req.user.userId is set by authenticate middleware
    const user = await User.findById(req.user!.userId);

    // This should never happen — JWT is valid but user was deleted
    // Handle defensively anyway
    if (!user) {
      throw new NotFoundError('User');
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  })
);