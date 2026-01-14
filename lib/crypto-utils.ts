import crypto from 'crypto'

/**
 * Encryption utilities for WhatsApp access tokens
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits for GCM
const AUTH_TAG_LENGTH = 16 // 128 bits

interface EncryptedData {
    encrypted: string
    iv: string
    authTag: string
}

/**
 * Get the encryption key from environment variables
 * Validates that the key is exactly 64 hex characters (32 bytes)
 */
function getEncryptionKey(): Buffer {
    const key = process.env.WHATSAPP_ENCRYPTION_KEY

    if (!key) {
        throw new Error('WHATSAPP_ENCRYPTION_KEY environment variable is not set')
    }

    if (key.length !== 64) {
        throw new Error('WHATSAPP_ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
    }

    // Convert hex string to buffer
    return Buffer.from(key, 'hex')
}

/**
 * Encrypt a token using AES-256-GCM
 * @param token - The plain text token to encrypt
 * @returns Object containing encrypted data, IV, and auth tag
 */
export function encryptToken(token: string): EncryptedData {
    try {
        const key = getEncryptionKey()

        // Generate random IV
        const iv = crypto.randomBytes(IV_LENGTH)

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

        // Encrypt the token
        let encrypted = cipher.update(token, 'utf8', 'hex')
        encrypted += cipher.final('hex')

        // Get authentication tag
        const authTag = cipher.getAuthTag()

        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        }
    } catch (error) {
        console.error('Encryption error:', error)
        throw new Error('Failed to encrypt token')
    }
}

/**
 * Decrypt a token using AES-256-GCM
 * @param encrypted - The encrypted token
 * @param iv - The initialization vector (hex string)
 * @param authTag - The authentication tag (hex string)
 * @returns The decrypted plain text token
 */
export function decryptToken(encrypted: string, iv: string, authTag: string): string {
    try {
        const key = getEncryptionKey()

        // Convert hex strings to buffers
        const ivBuffer = Buffer.from(iv, 'hex')
        const authTagBuffer = Buffer.from(authTag, 'hex')

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer)

        // Set authentication tag
        decipher.setAuthTag(authTagBuffer)

        // Decrypt the token
        let decrypted = decipher.update(encrypted, 'hex', 'utf8')
        decrypted += decipher.final('utf8')

        return decrypted
    } catch (error) {
        console.error('Decryption error:', error)
        throw new Error('Failed to decrypt token - data may be corrupted or tampered with')
    }
}

/**
 * Validate encryption key format
 * @returns true if valid, false otherwise
 */
export function validateEncryptionKey(): boolean {
    try {
        const key = process.env.WHATSAPP_ENCRYPTION_KEY

        if (!key || key.length !== 64) {
            return false
        }

        // Try to parse as hex
        Buffer.from(key, 'hex')
        return true
    } catch {
        return false
    }
}
