


import { AppError } from './AppError';

// 404 Not Found
// Use this when:
// - Project with that ID does not exist in database
// - User profile not found
// - File not found
// - Any resource the client requested does not exist
//
// Usage examples:
// throw new NotFoundError('Project')        → "Project not found"
// throw new NotFoundError('User')           → "User not found"
// throw new NotFoundError('Kanban card')    → "Kanban card not found"

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}