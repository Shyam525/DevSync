




// AppError is the parent class ALL custom errors extend.
// Never throw 'new Error()' in business code — always throw a specific AppError subclass.
//
// WHY? Because Error has no statusCode. The global error handler cannot know
// whether to send a 400, 401, 404, or 422 without this information.
//
// isOperational flag explained:
//
// isOperational = true  → EXPECTED error. User did something wrong.
//   Examples: wrong password, email already exists, project not found
//   Action: send the error message to the user
//
// isOperational = false → UNEXPECTED error. BUG in our code.
//   Examples: accessing a property on undefined, database schema mismatch
//   Action: crash the process (or alert team), never expose details to user
//
// In the global error handler (Week 3), we check isOperational to decide
// whether to send the real message or a generic "Something went wrong".

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true  // default true — most errors are operational
  ) {
    // Call Error constructor — this sets this.message
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Sets this.name to "AppError", "AuthError", etc.
    // Without this, every error shows name: "Error" which is useless in logs
    this.name = this.constructor.name;

    // Fixes the stack trace so it points to WHERE the error was thrown
    // Not to this constructor. Makes debugging much easier.
    Error.captureStackTrace(this, this.constructor);
  }
}











// --------------------------------------------------------------------------------------------------------------------------------------------













// export class AppError extends Error {
//   statusCode: number;
//   isOperational: boolean;

//   constructor(message: string, statusCode = 500, isOperational = true) {
//     super(message);
//     this.statusCode = statusCode;
//     this.isOperational = isOperational;
//     Error.captureStackTrace(this, this.constructor);
//   }
// }

