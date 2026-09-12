import { TokenPayload } from '../utils/jwtHelpers';
import { IProject } from '../models/Project';

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

      // NEW — attached by requireProjectRole middleware.
      // Route handlers can read req.project instead of querying the
      // database a second time for the same document.
      project?: IProject;
    }
  }
}