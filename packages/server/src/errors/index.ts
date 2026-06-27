// Barrel export — import ALL error classes from one place
//
// Without this file, every import would look like:
// import { AuthError } from '../errors/AuthError';
// import { NotFoundError } from '../errors/NotFoundError';
//
// With this file, it becomes:
// import { AuthError, NotFoundError } from '../errors';
//
// Cleaner imports everywhere in the codebase.

export { AppError } from './AppError';
export { AuthError } from './AuthError';
export { NotFoundError } from './NotFoundError';
export { ValidationError } from './ValidationError';
export { ForbiddenError } from './ForbiddenError';