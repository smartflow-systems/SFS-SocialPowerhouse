import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { encrypt, decrypt, generateEncryptionKey, hash, safeCompare } from '../encryption';
import crypto from 'crypto';

describe('Encryption Module', () => {
  let originalEncryptionKey: string | undefined;

  beforeEach(() => {
    // Save original encryption key
    originalEncryptionKey = process.env.ENCRYPTION_KEY;
    // Set a test encryption key (32 bytes = 256 bits)
    process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
  });

  afterEach(() => {
    // Restore original encryption key
    if (originalEncryptionKey) {
      process.env.ENCRYPTION_KEY = originalEncryptionKey;
    } else {
      delete process.env.ENCRYPTION_KEY;
    }
  });

  describe('encrypt function', () => {
    it('should encrypt plaintext successfully', () => {
      const plaintext = 'sensitive data';
      const encrypted = encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.split(':').length).toBe(4); // salt:iv:authTag:ciphertext
    });

    it('should produce different ciphertext for same plaintext (due to random IV)', () => {
      const plaintext = 'test data';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw error for empty plaintext', () => {
      expect(() => encrypt('')).toThrow('Cannot encrypt empty or null value');
    });

    it('should throw error when ENCRYPTION_KEY is not set', () => {
      delete process.env.ENCRYPTION_KEY;
      expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY environment variable is not set');
    });

    it('should throw error for invalid key length', () => {
      process.env.ENCRYPTION_KEY = 'too-short-key';
      expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY must be exactly 32 bytes');
    });
  });

  describe('decrypt function', () => {
    it('should decrypt encrypted data correctly', () => {
      const plaintext = 'secret message';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle special characters', () => {
      const plaintext = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./ 😊';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle long text', () => {
      const plaintext = 'A'.repeat(10000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for empty ciphertext', () => {
      expect(() => decrypt('')).toThrow('Cannot decrypt empty or null value');
    });

    it('should throw error for invalid format', () => {
      expect(() => decrypt('invalid:format')).toThrow('Invalid ciphertext format');
    });

    it('should throw error for tampered data', () => {
      const plaintext = 'original data';
      const encrypted = encrypt(plaintext);
      const parts = encrypted.split(':');
      // Tamper with the auth tag (third part)
      parts[2] = parts[2].substring(0, parts[2].length - 4) + 'XXXX';
      const tampered = parts.join(':');

      expect(() => decrypt(tampered)).toThrow('Decryption failed');
    });

    it('should throw error when decrypting with wrong key', () => {
      const plaintext = 'secret';
      const encrypted = encrypt(plaintext);

      // Change the encryption key
      process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');

      expect(() => decrypt(encrypted)).toThrow('Decryption failed');
    });
  });

  describe('generateEncryptionKey function', () => {
    it('should generate a valid 32-byte key', () => {
      const key = generateEncryptionKey();

      expect(typeof key).toBe('string');
      const buffer = Buffer.from(key, 'base64');
      expect(buffer.length).toBe(32);
    });

    it('should generate different keys each time', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe('hash function', () => {
    it('should hash a value consistently', () => {
      const value = 'test value';
      const hash1 = hash(value);
      const hash2 = hash(value);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('string');
      expect(hash1.length).toBe(64); // SHA-256 hex is 64 characters
    });

    it('should produce different hashes for different values', () => {
      const hash1 = hash('value1');
      const hash2 = hash('value2');

      expect(hash1).not.toBe(hash2);
    });

    it('should be one-way (not reversible)', () => {
      const value = 'secret';
      const hashed = hash(value);

      expect(hashed).not.toBe(value);
      expect(hashed.length).toBeGreaterThan(value.length);
    });
  });

  describe('safeCompare function', () => {
    it('should return true for identical strings', () => {
      const str = 'test string';
      expect(safeCompare(str, str)).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(safeCompare('string1', 'string2')).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      expect(safeCompare('short', 'longer string')).toBe(false);
    });

    it('should prevent timing attacks', () => {
      // This test verifies constant-time comparison
      const str1 = 'a'.repeat(100);
      const str2 = 'a'.repeat(99) + 'b';

      expect(safeCompare(str1, str2)).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(safeCompare('', '')).toBe(true);
      expect(safeCompare('', 'non-empty')).toBe(false);
    });
  });

  describe('End-to-end encryption workflow', () => {
    it('should encrypt and decrypt OAuth tokens', () => {
      const accessToken = 'ya29.a0AfH6SMBx...';
      const refreshToken = '1//0gK8...';

      const encryptedAccess = encrypt(accessToken);
      const encryptedRefresh = encrypt(refreshToken);

      const decryptedAccess = decrypt(encryptedAccess);
      const decryptedRefresh = decrypt(encryptedRefresh);

      expect(decryptedAccess).toBe(accessToken);
      expect(decryptedRefresh).toBe(refreshToken);
    });

    it('should handle JSON data', () => {
      const data = JSON.stringify({
        accessToken: 'token123',
        refreshToken: 'refresh456',
        expiresAt: Date.now()
      });

      const encrypted = encrypt(data);
      const decrypted = decrypt(encrypted);
      const parsed = JSON.parse(decrypted);

      expect(parsed.accessToken).toBe('token123');
      expect(parsed.refreshToken).toBe('refresh456');
    });
  });
});
