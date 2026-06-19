export function signAccessToken(_payload: object) {
  return 'access-token-placeholder';
}

export function signRefreshToken(_payload: object) {
  return 'refresh-token-placeholder';
}

export function verify(_token: string) {
  return { valid: true };
}
