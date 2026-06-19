import { AppError } from './AppError';

export class AuthError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}
