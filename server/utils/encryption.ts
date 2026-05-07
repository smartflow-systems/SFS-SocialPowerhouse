import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment variable
 * Key should be a 64-character hex string (32 bytes)
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;

  if (!keyHex) {
    throw new Error('ENCRYPTION_KEY environment variable is not set. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }

  if (keyHex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }

  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns format: iv:authTag:encryptedData (all hex encoded)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt ciphertext encrypted with AES-256-GCM
 * Expects format: iv:authTag:encryptedData (all hex encoded)
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();

  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format. Expected iv:authTag:encryptedData');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  if (iv.length !== IV_LENGTH) {
    throw new Error('Invalid IV length');
  }

  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Invalid auth tag length');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Validate that encryption is properly configured
 * Returns true if encryption key is set and valid
 */
export function validateEncryption(): { valid: boolean; error?: string } {
  try {
    const keyHex = process.env.ENCRYPTION_KEY;

    if (!keyHex) {
      return {
        valid: false,
        error: 'ENCRYPTION_KEY environment variable is not set'
      };
    }

    if (keyHex.length !== 64) {
      return {
        valid: false,
        error: 'ENCRYPTION_KEY must be a 64-character hex string'
      };
    }

    // Test encryption/decryption
    const testData = 'test_encryption_validation';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);

    if (decrypted !== testData) {
      return {
        valid: false,
        error: 'Encryption roundtrip validation failed'
      };
    }

    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Check if a string looks like encrypted data (has correct format)
 */
export function isEncrypted(data: string): boolean {
  if (!data || typeof data !== 'string') {
    return false;
  }

  const parts = data.split(':');
  if (parts.length !== 3) {
    return false;
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  // Check if all parts are valid hex strings
  const hexRegex = /^[0-9a-fA-F]+$/;

  return (
    ivHex.length === IV_LENGTH * 2 &&
    hexRegex.test(ivHex) &&
    authTagHex.length === AUTH_TAG_LENGTH * 2 &&
    hexRegex.test(authTagHex) &&
    encryptedHex.length > 0 &&
    hexRegex.test(encryptedHex)
  );
}

/**
 * Generate a new encryption key (for setup purposes)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}
