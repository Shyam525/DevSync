import { AppError } from './AppError';

// 403 Forbidden
// Use this when:
// - User IS logged in (we know who they are)
// - But their ROLE does not allow this action
// - Example: MEMBER tries to delete the project (only OWNER can)
// - Example: VIEWER tries to create a kanban card
//
// The difference matters:
// 401 AuthError → "Login first" (redirect to login page)
// 403 ForbiddenError → "You are logged in but don't have permission" (show error, don't redirect)

export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403);
  }
}

