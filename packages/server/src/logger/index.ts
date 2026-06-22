// const logger = {
//   info: console.log,
//   warn: console.warn,
//   error: console.error,
//   debug: console.debug,
// };

// export default logger;




import pino from 'pino';
import { env } from '../config/env';

// Pino is a high-performance structured logger
// It outputs JSON in production (for log management tools)
// It outputs colored human-readable text in development

export const logger = pino({
  // Only log 'debug' and above in development
  // Only log 'info' and above in production (less noise)
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  
  // pino-pretty makes logs readable in development
  // In production, we want raw JSON (faster and parseable by log tools)
  transport:
    env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',   // Remove noise from log lines
          },
        }
      : undefined,  // No pretty printing in production
});