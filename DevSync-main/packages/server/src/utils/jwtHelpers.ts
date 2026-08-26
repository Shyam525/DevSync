// export function signAccessToken(_payload: object) {
//   return 'access-token-placeholder';
// }

// export function signRefreshToken(_payload: object) {
//   return 'refresh-token-placeholder';
// }

// export function verify(_token: string) {
//   return { valid: true };
// }


// npm install jsonwebtoken
// npm install --save-dev @types/jsonwebtoken


import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthError } from '../errors';

// ─── UNDERSTAND JWT FIRST ─────────────────────────────────────────────────
//
// A JWT (JSON Web Token) is a string that looks like:
// eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.SflKxwRJSMeKKF2QT4fw
//
// It has 3 parts separated by dots:
// Part 1 (Header) → algorithm used (HS256)
// Part 2 (Payload) → the data you stored (userId, email)
// Part 3 (Signature) → proof it was created by YOUR server using YOUR secret
//
// Anyone can READ the payload (it is base64 encoded, not encrypted)
// But only someone with YOUR secret can CREATE a valid signature
//
// This is why JWT_ACCESS_SECRET must be secret — if attackers know it,
// they can create fake tokens pretending to be any user
//
// ─── ACCESS TOKEN vs REFRESH TOKEN ───────────────────────────────────────
//
// Access Token:
// - Expires in 15 minutes (short)
// - Sent with every API request in Authorization header
// - If stolen → attacker has 15 min of access max
//
// Refresh Token:
// - Expires in 7 days (long)
// - Stored in httpOnly cookie (JavaScript cannot read it)
// - Only used to get a NEW access token when the old one expires
// - If stolen → can be revoked by removing from user's refreshTokens array
//
// TWO DIFFERENT SECRETS are used intentionally.
// If one secret leaks, only one token type is compromised.

// The data stored inside every JWT
export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;   // Issued At — automatically added by jwt.sign
  exp?: number;   // Expires At — automatically added by jwt.sign
}

// ─── Access Token Functions ────────────────────────────────────────────────

export const signAccessToken = (
  payload: Omit<TokenPayload, 'iat' | 'exp'>
): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};



export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    // jwt.verify returns the payload if the token is valid
    // Throws JsonWebTokenError if signature is wrong
    // Throws TokenExpiredError if token has expired
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  } catch {
    // We catch ALL jwt errors and throw our own AuthError
    // This keeps error handling consistent — callers only need to handle AuthError
    throw new AuthError('Invalid or expired access token');
  }
};


// ─── Refresh Token Functions ───────────────────────────────────────────────

export const signRefreshToken = (
  payload: Omit<TokenPayload, 'iat' | 'exp'>
): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    throw new AuthError('Invalid or expired refresh token');
  }
};

