import crypto from 'crypto';

/**
 * Shared Security Utilities for AmisiMedOS
 */

/**
 * Hashes a password using PBKDF2.
 * This is zero-dependency and secure for HIPAA-compliant environments.
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err: Error | null, derivedKey: Buffer) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifies a password against a stored hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = storedHash.split(':');
    if (parts.length !== 2) {
      resolve(false);
      return;
    }
    const [salt, key] = parts;
    crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err: Error | null, derivedKey: Buffer) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
}
