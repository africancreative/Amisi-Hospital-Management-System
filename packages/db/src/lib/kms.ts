import vault from 'node-vault';
import { Buffer } from 'buffer';

/**
 * Amisi Sovereign KMS (S-KMS) - Vault Edition
 * 
 * Implements internal Key Management using HashiCorp Vault.
 * Uses the 'Transit' secret engine to securely wrap/unwrap DEKs.
 */

const vaultClient = vault({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_ADDR || 'http://vault:8200',
    token: process.env.VAULT_TOKEN || 'amisi-root-token'
});

export const kms = {
    /**
     * Generates a new cryptographically strong Data Encryption Key (DEK).
     */
    generateDataKey(): string {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    },

    /**
     * Wraps (encrypts) a Data Encryption Key using Vault's Transit Engine.
     */
    async wrapKey(dek: string): Promise<string> {
        try {
            const result = await (vaultClient as any).transitEncrypt({
                name: 'amisi-master-key',
                plaintext: Buffer.from(dek).toString('base64')
            });
            return result.data.ciphertext;
        } catch (err) {
            console.error('[S-KMS] Vault encryption failed:', err);
            throw new Error('Sovereign KMS encryption error');
        }
    },

    /**
     * Unwraps (decrypts) a Data Encryption Key using Vault's Transit Engine.
     */
    async unwrapKey(wrappedKey: string): Promise<string> {
        try {
            const result = await (vaultClient as any).transitDecrypt({
                name: 'amisi-master-key',
                ciphertext: wrappedKey
            });
            return Buffer.from(result.data.plaintext, 'base64').toString('utf8');
        } catch (err) {
            console.error('[S-KMS] Vault decryption failed:', err);
            throw new Error('Sovereign KMS decryption error');
        }
    }
};
