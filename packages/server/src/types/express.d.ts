import { TokenPayload } from '../utils/jwtHelpers';

declare global {
  namespace Express {
    interface Request {
      // Attached by requestId.ts middleware
      // Every request has a unique UUID for tracing
      requestId: string;

      // Attached by auth.middleware.ts
      // undefined if the route is public (no authentication required)
      // TokenPayload if the user is authenticated
      user?: TokenPayload;
    }
  }
}