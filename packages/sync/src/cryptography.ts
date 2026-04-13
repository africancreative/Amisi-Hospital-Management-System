import crypto from 'crypto';

/**
 * Sync Cryptography Service
 * Handles payload encryption (AES-256-GCM) and digital signatures (Ed25519)
 */

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a payload for secure transit
 */
export function encryptPayload(payload: any, secretKey: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.scryptSync(secretKey, 'salt', KEY_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    const jsonPayload = JSON.stringify(payload);
    let encrypted = cipher.update(jsonPayload, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:authTag:encryptedPayload
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a payload received from a sync partner
 */
export function decryptPayload(encryptedData: string, secretKey: string): any {
    const [ivHex, authTagHex, encryptedPayload] = encryptedData.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = crypto.scryptSync(secretKey, 'salt', KEY_LENGTH);

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedPayload, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
}

/**
 * Signs a message using Ed25519
 */
export function signEvent(message: string, privateKeyPem: string): string {
    const signer = crypto.createSign('RSA-SHA256'); // Fallback to RSA if Ed25519 is complex with PEM
    // Note: Ed25519 in Node works best with KeyObject
    // For MVP we use sign/verify with Ed25519 specifically

    const signature = crypto.sign(null, Buffer.from(message), {
        key: privateKeyPem,
        format: 'pem',
        type: 'pkcs8'
    });

    return signature.toString('hex');
}

/**
 * Verifies an Ed25519 signature
 */
export function verifySignature(message: string, signatureHex: string, publicKeyPem: string): boolean {
    const isVerified = crypto.verify(null, Buffer.from(message), {
        key: publicKeyPem,
        format: 'pem',
        type: 'spki'
    }, Buffer.from(signatureHex, 'hex'));

    return isVerified;
}

/**
 * Generates a new Ed25519 key pair for a tenant edge server
 */
export function generateKeyPair() {
    return crypto.generateKeyPairSync('ed25519', {
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
}
