



import { AppError } from './AppError';

// 422 Unprocessable Entity
// Use this when:
// - Zod schema validation fails (Week 3 — the validate middleware throws this)
// - Business rule validation fails (email already exists, etc.)
// - Input is valid format but violates a rule
//
// DIFFERENCE: 400 Bad Request = malformed request (cannot parse)
//             422 Unprocessable = can parse, but violates rules
//
// We use 422 for all validation failures because it is more precise.

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 422);
  }
}


