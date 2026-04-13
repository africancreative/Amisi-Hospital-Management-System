import crypto from 'crypto';

/**
 * Encryption Service: AES-256-GCM
 * 
 * Provides authenticated encryption for sync payloads.
 * Ensures data is opaque on the Cloud Hub but readable by authorized Edge nodes.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Encrypts a JSON payload using a shared secret.
 */
export function encryptPayload(payload: any, secret: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  // Derive a 32-byte key from the secret
  const key = crypto.createHash('sha256').update(secret).digest();
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const serialized = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(serialized, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: iv:tag:encrypted (hex)
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts an AES-256-GCM payload.
 */
export function decryptPayload(encryptedString: string, secret: string): any {
  const [ivHex, tagHex, encryptedHex] = encryptedString.split(':');
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error('Invalid encrypted payload format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const key = crypto.createHash('sha256').update(secret).digest();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

/**
 * Selected-Field Extraction
 * Extracts specific non-sensitive fields from a payload to remain unencrypted.
 */
export function extractSelectedFields(payload: any, fields: string[]): any {
  const result: any = {};
  for (const field of fields) {
    if (payload[field] !== undefined) {
      result[field] = payload[field];
    }
  }
  return result;
}
