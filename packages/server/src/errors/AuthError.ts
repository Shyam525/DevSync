// import { AppError } from './AppError';

// export class AuthError extends AppError {
//   constructor(message = 'Authentication failed') {
//     super(message, 401);
//   }
// }


import { AppError } from './AppError';

// 401 Unauthorized
// Use this when:
// - User is not logged in (no token)
// - JWT token is invalid or expired
// - Password is wrong
// - GitHub OAuth fails
//
// 401 means "I don't know who you are"
// Compare with ForbiddenError (403) which means "I know who you are, but NO"

export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    // Note: isOperational defaults to true — authentication failures are expected
  }
}