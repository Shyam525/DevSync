// import { Request, Response, NextFunction } from 'express';
// import { ZodSchema, ZodError } from 'zod';
// import { ValidationError } from '../errors';

// // ─── WHY THIS MIDDLEWARE EXISTS ───────────────────────────────────────────
// //
// // Every route receives user input via req.body. That input can be:
// // - Missing required fields (no email in a register request)
// // - Wrong format (email that is not an email)
// // - Too long (username with 10,000 characters)
// // - The wrong type (sending a number where a string is expected)
// //
// // Without validation, this bad data reaches your service layer
// // and causes crashes or corrupt data in your database.
// //
// // validate() is a factory function:
// // You call it with a Zod schema → it returns middleware.
// //
// // USAGE:
// // router.post('/register', validate(registerSchema), handler)
// //
// // What validate() does:
// // 1. Runs req.body through the Zod schema
// // 2. If valid → replaces req.body with the cleaned/transformed data
// //    (trimmed strings, lowercased emails, etc. — from Zod transforms)
// // 3. If invalid → throws ValidationError with specific field errors
// // 4. Route handler ONLY runs if validation passes

// export const validate = (schema: ZodSchema) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     try {
//       // schema.parse() does two things:
//       // 1. VALIDATES — checks all rules (required, min length, email format, etc.)
//       // 2. TRANSFORMS — applies .trim(), .toLowerCase(), type coercion, etc.
//       //
//       // We REPLACE req.body with the parsed result so:
//       // - Strings are trimmed (no leading/trailing spaces)
//       // - Emails are lowercased (Test@Email.COM → test@email.com)
//       // - All values are the exact types the schema defines
//       req.body = schema.parse(req.body);

//       next();
//     } catch (error) {
//       if (error instanceof ZodError) {
//         // ZodError.errors is an array of all validation failures
//         // Format them into a readable string:
//         // "email: Invalid email format, password: Must be at least 8 characters"
//         const message = error.errors
//           .map(e => `${e.path.join('.')}: ${e.message}`)
//           .join(', ');

//         // Throw ValidationError (422) — flows to global errorHandler
//         throw new ValidationError(message);
//       }

//       // If it is not a ZodError, something unexpected happened
//       // Re-throw so the global errorHandler catches it as a 500
//       throw error;
//     }
//   };
// };


import { ZodTypeAny, ZodError } from "zod";

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map(issue => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");

        throw new ValidationError(message);
      }

      throw error;
    }
  };
};