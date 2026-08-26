import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the server package folder
// path.resolve goes from this file's location up to find .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define the EXACT shape and validation rules for every env variable
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // z.coerce.number() converts the string "4000" to the number 4000
  // process.env is always strings — coerce converts them
  PORT: z.coerce.number().default(4000),
  
  // .url() checks it is a valid URL format
  MONGO_URI: z.string().url('MONGO_URI must be a valid MongoDB URL'),
  REDIS_URL: z.string().url('REDIS_URL must be a valid Redis URL'),
  
  // .min(32) means the secret must be at least 32 characters
  // Short secrets are easy to crack — this enforces security
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

// This single line does two things:
// 1. Reads all variables from process.env
// 2. Validates them against the schema above
// If ANY variable is missing or wrong → throws immediately with a CLEAR error message
// Server NEVER starts with broken configuration
export const env = envSchema.parse(process.env);

// After this line, env.PORT is a number (not string), env.MONGO_URI is a valid URL, etc.
// TypeScript knows the exact types — no more "string | undefined" everywhere