import { Request, Response, NextFunction } from 'express';

// ─── THE PROBLEM THIS SOLVES ───────────────────────────────────────────────
//
// Express version 4 (what we use) does NOT catch errors from async functions.
//
// Imagine this route WITHOUT asyncHandler:
//
//   app.post('/register', async (req, res) => {
//     const user = await User.create(req.body);  // ← what if this throws?
//     res.json(user);
//   });
//
// If User.create() throws, Express does NOT catch it.
// The error is an "unhandled promise rejection".
// The server either crashes or the request hangs forever.
//
// The OLD way to fix this (before asyncHandler):
//
//   app.post('/register', async (req, res, next) => {
//     try {
//       const user = await User.create(req.body);
//       res.json(user);
//     } catch (error) {
//       next(error);  // manually forward to error handler
//     }
//   });
//
// This works, but you need try/catch in EVERY SINGLE ROUTE.
// With 20 routes, that is 20 try/catch blocks. Repetitive. Error-prone.
//
// ─── THE SOLUTION ──────────────────────────────────────────────────────────
//
// asyncHandler is a WRAPPER FUNCTION.
// You pass your async route function INTO it.
// It returns a new function that wraps yours in try/catch automatically.
//
// With asyncHandler:
//
//   app.post('/register', asyncHandler(async (req, res) => {
//     const user = await User.create(req.body);  // throws → caught → forwarded
//     res.json(user);
//   }));
//
// No try/catch. No next(error). Clean, readable routes.

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (fn: AsyncRouteHandler) => {
  // Return a new regular (non-async) function
  return (req: Request, res: Response, next: NextFunction): void => {
    // Execute fn — this returns a Promise
    // .catch(next) means: if the Promise rejects, call next(error)
    // next(error) forwards the error to Express's global error handler
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};