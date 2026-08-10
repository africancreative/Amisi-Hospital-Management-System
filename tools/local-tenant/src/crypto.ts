import * as crypto from 'crypto';

/**
 * PBKDF2-SHA512 password hashing, byte-for-byte compatible with
 * packages/db/src/lib/crypto.ts (used by the web app's login flow).
 * Format: `<saltHex>:<derivedKeyHex>` (16-byte salt, 64-byte key, 1000 iterations).
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512');
  return `${salt}:${derivedKey.toString('hex')}`;
}

/** 64 random bytes as hex — used for shared secrets and API keys. */
export function randomSecret(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/** URL-safe base64 for JWT signing keys etc. */
export function randomBase64Url(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}
