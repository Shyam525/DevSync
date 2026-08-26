// export const placeholder = () => {};
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwtHelpers';
import { AuthError } from '../errors';

// ─── WHY THIS MIDDLEWARE EXISTS ───────────────────────────────────────────
//
// Protected routes need to know WHO is making the request.
// This middleware:
// 1. Reads the JWT from the Authorization header
// 2. Verifies it is valid and not expired
// 3. Attaches the user payload to req.user
// 4. Calls next() to proceed to the route handler
//
// If the token is missing or invalid — throws AuthError (401)
// and the global errorHandler returns a 401 response.
// The route handler NEVER runs for unauthenticated requests.
//
// HOW TO USE IN ROUTES:
// router.get('/profile', authenticate, handler)
//                        ^^^^^^^^^^^^
//                        This runs before handler.
//                        If it throws, handler never runs.

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // The standard header format is: "Authorization: Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;


  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Access token required. Include Authorization: Bearer <token> header.');
  }


  const token = authHeader.substring(7);



  if (!token) {
    throw new AuthError('Access token is empty.');
  }

 
  const payload = verifyAccessToken(token);

  
  req.user = payload;

  next();
};