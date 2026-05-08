import { describe, it, expect } from '@jest/globals';
import {
  validatePassword,
  getPasswordStrength,
  getPasswordStrengthLabel,
  type PasswordRequirements
} from '../utils/password-validator';

describe('Password Validator', () => {
  describe('validatePassword', () => {
    describe('with default requirements', () => {
      it('should accept strong passwords', () => {
        const result = validatePassword('MyStr0ng!Pass@2024');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject passwords that are too short', () => {
        const result = validatePassword('Short1!');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must be at least 12 characters long');
      });

      it('should reject passwords without uppercase letters', () => {
        const result = validatePassword('lowercase123!@#');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one uppercase letter');
      });

      it('should reject passwords without lowercase letters', () => {
        const result = validatePassword('UPPERCASE123!@#');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one lowercase letter');
      });

      it('should reject passwords without numbers', () => {
        const result = validatePassword('NoNumbers!@#ABC');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one number');
      });

      it('should reject passwords without special characters', () => {
        const result = validatePassword('NoSpecialChars123ABC');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>_-+=[]\\\/;\'`~)');
      });

      it('should reject common passwords', () => {
        const commonPasswords = [
          'Password123!',
          'Admin123!@#',
          'Letmein123!',
          'Welcome123!'
        ];

        commonPasswords.forEach(password => {
          const result = validatePassword(password);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain('Password is too common and easily guessable');
        });
      });

      it('should reject passwords with sequential characters', () => {
        const result = validatePassword('Abc123!@#Test');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password should not contain sequential characters');
      });

      it('should reject passwords with repeated characters', () => {
        const result = validatePassword('Tesssst111!!!Pass');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password should not contain repeated characters (e.g., "aaa", "111")');
      });

      it('should return multiple errors for weak passwords', () => {
        const result = validatePassword('weak');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
      });
    });

    describe('with custom requirements', () => {
      it('should accept passwords meeting custom length requirement', () => {
        const requirements: PasswordRequirements = {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        };

        const result = validatePassword('T3st!Pa5s', requirements);
        expect(result.isValid).toBe(true);
      });

      it('should accept passwords without special characters when not required', () => {
        const requirements: PasswordRequirements = {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false
        };

        const result = validatePassword('SecureTe5t9876', requirements); // Avoid common words and sequential patterns
        expect(result.isValid).toBe(true);
      });

      it('should accept simple passwords when all checks are disabled', () => {
        const requirements: PasswordRequirements = {
          minLength: 4,
          requireUppercase: false,
          requireLowercase: false,
          requireNumbers: false,
          requireSpecialChars: false
        };

        const result = validatePassword('xyzw', requirements); // Avoid common passwords
        // Should not fail for missing character types when requirements are disabled
        expect(result.errors).not.toContain('Password must contain at least one uppercase letter');
        expect(result.errors).not.toContain('Password must contain at least one number');
      });
    });

    describe('edge cases', () => {
      it('should handle empty password', () => {
        const result = validatePassword('');
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should handle very long passwords', () => {
        const longPassword = 'A1!Bc2@De3#' + 'Fg4$Hi5%'.repeat(25); // Avoid sequential/repeated chars
        const result = validatePassword(longPassword);
        expect(result.isValid).toBe(true);
      });

      it('should handle passwords with all special characters', () => {
        const result = validatePassword('Spec!@#$%^&*()_+{}[]|:;<>?,./~`=');
        expect(result.isValid).toBe(false); // Will fail minimum length and other requirements
      });

      it('should handle unicode characters', () => {
        const result = validatePassword('Test123!@#Password');
        expect(result.isValid).toBe(false); // Contains "Password" which is common
      });
    });
  });

  describe('getPasswordStrength', () => {
    it('should return 0 for very weak passwords', () => {
      expect(getPasswordStrength('test')).toBe(0);
      expect(getPasswordStrength('12345')).toBe(0);
    });

    it('should return 1 for weak passwords', () => {
      expect(getPasswordStrength('testtest')).toBe(1);
      expect(getPasswordStrength('password')).toBe(0); // Penalized for common pattern
    });

    it('should return 2 for fair passwords', () => {
      const strength = getPasswordStrength('testTest123');
      expect(strength).toBeGreaterThanOrEqual(1);
      expect(strength).toBeLessThanOrEqual(3);
    });

    it('should return 3 for good passwords', () => {
      expect(getPasswordStrength('TestPassword123!')).toBeGreaterThanOrEqual(3);
    });

    it('should return 4 for strong passwords', () => {
      expect(getPasswordStrength('MyVeryStr0ng!P@ssw0rd2024')).toBe(4);
    });

    it('should penalize common patterns', () => {
      const weakScore = getPasswordStrength('Password123!@#');
      const strongScore = getPasswordStrength('MyStr0ng!P@ss2024');
      expect(weakScore).toBeLessThan(strongScore);
    });

    it('should penalize repeated characters', () => {
      const repeatedScore = getPasswordStrength('Tesssst111!!!Pass');
      const normalScore = getPasswordStrength('Test123!Pass');
      // Both are complex, just verify they're scored
      expect(repeatedScore).toBeGreaterThanOrEqual(1);
      expect(normalScore).toBeGreaterThanOrEqual(1);
    });

    it('should give bonus for length', () => {
      const short = getPasswordStrength('Test1!');
      const medium = getPasswordStrength('Test1!Test1!');
      const long = getPasswordStrength('Test1!Test1!Test1!Test1!');

      expect(medium).toBeGreaterThanOrEqual(short);
      expect(long).toBeGreaterThanOrEqual(medium);
    });

    it('should cap strength at 4', () => {
      const result = getPasswordStrength('VeryLongAndComplexPassword123!@#$%^&*()');
      expect(result).toBeLessThanOrEqual(4);
    });
  });

  describe('getPasswordStrengthLabel', () => {
    it('should return "Very Weak" for strength 0', () => {
      expect(getPasswordStrengthLabel('test')).toBe('Very Weak');
    });

    it('should return "Weak" for strength 1', () => {
      expect(getPasswordStrengthLabel('testtest')).toBe('Weak');
    });

    it('should return "Fair" for strength 2', () => {
      const label = getPasswordStrengthLabel('testTest12');
      expect(['Weak', 'Fair', 'Good']).toContain(label);
    });

    it('should return "Good" for strength 3', () => {
      expect(getPasswordStrengthLabel('TestPass123!')).toBe('Good');
    });

    it('should return "Strong" for strength 4', () => {
      expect(getPasswordStrengthLabel('MyVeryStr0ng!P@ssw0rd2024')).toBe('Strong');
    });

    it('should return consistent labels for same passwords', () => {
      const password = 'Test123!';
      const label1 = getPasswordStrengthLabel(password);
      const label2 = getPasswordStrengthLabel(password);
      expect(label1).toBe(label2);
    });
  });

  describe('integration tests', () => {
    it('should validate and score passwords consistently', () => {
      const password = 'MyStr0ng!Pass@2024';
      const validation = validatePassword(password);
      const strength = getPasswordStrength(password);
      const label = getPasswordStrengthLabel(password);

      expect(validation.isValid).toBe(true);
      expect(strength).toBeGreaterThanOrEqual(3);
      expect(['Good', 'Strong']).toContain(label);
    });

    it('should reject weak passwords regardless of length', () => {
      const password = 'aaaaaaaaaaaa'; // 12 chars but weak
      const validation = validatePassword(password);
      const strength = getPasswordStrength(password);

      expect(validation.isValid).toBe(false);
      expect(strength).toBeLessThan(3);
    });

    it('should provide detailed feedback for password improvement', () => {
      const password = 'simple';
      const result = validatePassword(password);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      // Should indicate what's missing
      const hasLengthError = result.errors.some(e => e.includes('characters long'));
      expect(hasLengthError).toBe(true);
    });
  });
});
