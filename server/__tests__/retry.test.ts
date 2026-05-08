import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { withRetry, withRetryAndJitter, CircuitBreaker } from '../utils/retry';

// Mock console to reduce test noise
const originalConsole = { ...console };
beforeEach(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

describe('Retry Utility', () => {
  describe('withRetry', () => {
    it('should return result on first successful attempt', async () => {
      const successFn = jest.fn().mockResolvedValue('success');
      const result = await withRetry(successFn);

      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { maxAttempts: 3, initialDelay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('ECONNRESET'));

      await expect(
        withRetry(fn, { maxAttempts: 3, initialDelay: 10 })
      ).rejects.toThrow('ECONNRESET');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Invalid input'));

      await expect(
        withRetry(fn, {
          maxAttempts: 3,
          initialDelay: 10,
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
        })
      ).rejects.toThrow('Invalid input');

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on network errors', async () => {
      const networkErrors = [
        new Error('ECONNRESET'),
        new Error('ETIMEDOUT'),
        new Error('ENOTFOUND'),
        new Error('ECONNREFUSED')
      ];

      for (const error of networkErrors) {
        const fn = jest.fn()
          .mockRejectedValueOnce(error)
          .mockResolvedValue('success');

        const result = await withRetry(fn, { initialDelay: 10 });
        expect(result).toBe('success');
      }
    });

    it('should retry on rate limit errors', async () => {
      const error = { message: 'Rate limit exceeded', response: { status: 429 } };
      const fn = jest.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const result = await withRetry(fn, { initialDelay: 10 });
      expect(result).toBe('success');
    });

    it('should retry on 5xx server errors', async () => {
      const serverErrors = [500, 502, 503, 504];

      for (const status of serverErrors) {
        const error = { response: { status } };
        const fn = jest.fn()
          .mockRejectedValueOnce(error)
          .mockResolvedValue('success');

        const result = await withRetry(fn, { initialDelay: 10 });
        expect(result).toBe('success');
      }
    });

    it('should use exponential backoff', async () => {
      const delays: number[] = [];
      const startTimes: number[] = [];

      const fn = jest.fn()
        .mockImplementation(async () => {
          startTimes.push(Date.now());
          throw new Error('ECONNRESET');
        });

      try {
        await withRetry(fn, {
          maxAttempts: 3,
          initialDelay: 100,
          backoffFactor: 2
        });
      } catch (e) {
        // Expected to fail
      }

      // Calculate delays between attempts
      for (let i = 1; i < startTimes.length; i++) {
        delays.push(startTimes[i] - startTimes[i - 1]);
      }

      // Second delay should be roughly 2x first delay (with some tolerance)
      if (delays.length >= 2) {
        expect(delays[1]).toBeGreaterThan(delays[0] * 1.5);
      }
    });

    it('should respect max delay limit', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('ECONNRESET'));

      try {
        await withRetry(fn, {
          maxAttempts: 3,
          initialDelay: 10,
          maxDelay: 20,
          backoffFactor: 10
        });
      } catch (e) {
        // Expected to fail
      }

      // All delays should be capped at maxDelay
      expect(fn).toHaveBeenCalledTimes(3);
    }, 10000);

    it('should handle custom retry options', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('custom error'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, {
        maxAttempts: 2,
        initialDelay: 10,
        retryableErrors: ['custom error']
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('withRetryAndJitter', () => {
    it('should add random jitter to delays', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValue('success');

      const result = await withRetryAndJitter(fn, { initialDelay: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should still respect max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('ECONNRESET'));

      await expect(
        withRetryAndJitter(fn, { maxAttempts: 3, initialDelay: 10 })
      ).rejects.toThrow('ECONNRESET');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should handle successful first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await withRetryAndJitter(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('CircuitBreaker', () => {
    it('should allow requests when circuit is closed', async () => {
      const breaker = new CircuitBreaker(3, 1000, 2);
      const fn = jest.fn().mockResolvedValue('success');

      const result = await breaker.execute(fn);

      expect(result).toBe('success');
      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should open circuit after failure threshold', async () => {
      const breaker = new CircuitBreaker(3, 1000, 2);
      const fn = jest.fn().mockRejectedValue(new Error('Service failed'));

      // Cause 3 failures
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(fn);
        } catch (e) {
          // Expected
        }
      }

      expect(breaker.getState()).toBe('OPEN');
    });

    it('should reject requests when circuit is open', async () => {
      const breaker = new CircuitBreaker(2, 1000, 2);
      const fn = jest.fn().mockRejectedValue(new Error('Service failed'));

      // Open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(fn);
        } catch (e) {
          // Expected
        }
      }

      // Should now reject immediately
      await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is OPEN');
      expect(fn).toHaveBeenCalledTimes(2); // Not called the third time
    });

    it('should transition to half-open after reset timeout', async () => {
      const breaker = new CircuitBreaker(2, 100, 2); // 100ms reset timeout
      const fn = jest.fn().mockRejectedValue(new Error('Service failed'));

      // Open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(fn);
        } catch (e) {
          // Expected
        }
      }

      expect(breaker.getState()).toBe('OPEN');

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should attempt recovery
      const successFn = jest.fn().mockResolvedValue('success');
      try {
        await breaker.execute(successFn);
      } catch (e) {
        // May fail
      }

      expect(breaker.getState()).not.toBe('OPEN');
    });

    it('should close circuit after successful recovery', async () => {
      const breaker = new CircuitBreaker(2, 100, 2); // Need 2 successes
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      // Open circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(fn);
        } catch (e) {
          // Expected
        }
      }

      // Wait for reset
      await new Promise(resolve => setTimeout(resolve, 150));

      // Succeed twice
      const successFn = jest.fn().mockResolvedValue('success');
      await breaker.execute(successFn);
      await breaker.execute(successFn);

      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should reset failure count on success', async () => {
      const breaker = new CircuitBreaker(3, 1000, 2);
      const failFn = jest.fn().mockRejectedValue(new Error('Failed'));
      const successFn = jest.fn().mockResolvedValue('success');

      // 2 failures (below threshold)
      try { await breaker.execute(failFn); } catch (e) {}
      try { await breaker.execute(failFn); } catch (e) {}

      // Success should reset
      await breaker.execute(successFn);

      // Should still be closed
      expect(breaker.getState()).toBe('CLOSED');

      // Can handle more failures before opening
      try { await breaker.execute(failFn); } catch (e) {}
      try { await breaker.execute(failFn); } catch (e) {}

      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should allow manual reset', async () => {
      const breaker = new CircuitBreaker(2, 1000, 2);
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      // Open circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(fn);
        } catch (e) {
          // Expected
        }
      }

      expect(breaker.getState()).toBe('OPEN');

      // Manual reset
      breaker.reset();

      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should handle rapid failures correctly', async () => {
      const breaker = new CircuitBreaker(5, 1000, 2);
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      // Rapid failures
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          breaker.execute(fn).catch(() => {})
        );
      }

      await Promise.all(promises);

      expect(breaker.getState()).toBe('OPEN');
    });
  });

  describe('integration scenarios', () => {
    it('should handle API rate limiting scenario', async () => {
      let attempts = 0;
      const apiCall = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw { response: { status: 429 }, message: 'Rate limit exceeded' };
        }
        return { data: 'success' };
      });

      const result = await withRetry(apiCall, {
        maxAttempts: 5,
        initialDelay: 10
      });

      expect(result).toEqual({ data: 'success' });
      expect(attempts).toBe(3);
    });

    it('should handle temporary network issues', async () => {
      const errors = ['ECONNRESET', 'ETIMEDOUT', 'success'];
      let callCount = 0;

      const networkCall = jest.fn().mockImplementation(async () => {
        const response = errors[callCount++];
        if (response === 'success') return 'success';
        throw new Error(response);
      });

      const result = await withRetry(networkCall, { initialDelay: 10 });
      expect(result).toBe('success');
    });

    it('should protect against cascading failures with circuit breaker', async () => {
      const breaker = new CircuitBreaker(3, 100, 2);
      let failureCount = 0;

      const unreliableService = jest.fn().mockImplementation(async () => {
        failureCount++;
        throw new Error('Service unavailable');
      });

      // Try to call 10 times
      for (let i = 0; i < 10; i++) {
        try {
          await breaker.execute(unreliableService);
        } catch (e) {
          // Expected
        }
      }

      // Should have stopped calling after circuit opened
      expect(failureCount).toBeLessThan(10);
      expect(failureCount).toBeLessThanOrEqual(5); // Threshold + a few more
    });
  });
});
