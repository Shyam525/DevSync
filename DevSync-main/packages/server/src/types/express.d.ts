import { TokenPayload } from '../utils/jwtHelpers';
import { IProject } from '../models/Project';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: TokenPayload;

      // NEW — attached by requireProjectRole middleware (Step 3 above).
      // Route handlers can read req.project instead of querying the
      // database a second time for the same document.
      project?: IProject;
    }
  }
}