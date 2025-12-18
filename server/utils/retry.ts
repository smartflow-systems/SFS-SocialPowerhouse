/**
 * Retry utility with exponential backoff
 * Handles transient failures gracefully
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'rate limit',
    'temporarily unavailable',
    'service unavailable',
    '429', // Too Many Requests
    '500', // Internal Server Error
    '502', // Bad Gateway
    '503', // Service Unavailable
    '504', // Gateway Timeout
  ],
};

/**
 * Executes a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      console.log(`[Retry] Attempt ${attempt}/${opts.maxAttempts}`);
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      const isRetryable = isRetryableError(error, opts.retryableErrors);

      if (!isRetryable || attempt === opts.maxAttempts) {
        console.error(
          `[Retry] Failed after ${attempt} attempts:`,
          error.message || error
        );
        throw error;
      }

      console.warn(
        `[Retry] Attempt ${attempt} failed (${error.message || error}). Retrying in ${delay}ms...`
      );

      // Wait before retrying
      await sleep(delay);

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * opts.backoffFactor, opts.maxDelay);
    }
  }

  throw lastError;
}

/**
 * Determines if an error should trigger a retry
 */
function isRetryableError(error: any, retryableErrors: string[]): boolean {
  if (!error) return false;

  const errorString = JSON.stringify(error).toLowerCase();
  const errorMessage = (error.message || '').toLowerCase();
  const errorCode = error.code || '';
  const statusCode = error.response?.status?.toString() || '';

  return retryableErrors.some((pattern) => {
    const lowerPattern = pattern.toLowerCase();
    return (
      errorString.includes(lowerPattern) ||
      errorMessage.includes(lowerPattern) ||
      errorCode === pattern ||
      statusCode === pattern
    );
  });
}

/**
 * Sleeps for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries a function with jitter to avoid thundering herd problem
 */
export async function withRetryAndJitter<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      const isRetryable = isRetryableError(error, opts.retryableErrors);

      if (!isRetryable || attempt === opts.maxAttempts) {
        throw error;
      }

      // Add jitter (random value between 0 and delay)
      const jitter = Math.random() * delay;
      const totalDelay = delay + jitter;

      console.warn(
        `[Retry] Attempt ${attempt} failed. Retrying in ${Math.round(totalDelay)}ms...`
      );

      await sleep(totalDelay);

      delay = Math.min(delay * opts.backoffFactor, opts.maxDelay);
    }
  }

  throw lastError;
}

/**
 * Circuit breaker pattern to prevent cascading failures
 */
export class CircuitBreaker {
  private failures = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly resetTimeout: number = 60000, // 1 minute
    private readonly successThreshold: number = 2
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should reset
    if (
      this.state === 'OPEN' &&
      this.lastFailureTime &&
      Date.now() - this.lastFailureTime > this.resetTimeout
    ) {
      console.log('[CircuitBreaker] Attempting to close circuit (HALF_OPEN)');
      this.state = 'HALF_OPEN';
      this.successCount = 0;
    }

    // Reject immediately if circuit is open
    if (this.state === 'OPEN') {
      throw new Error(
        'Circuit breaker is OPEN. Service temporarily unavailable.'
      );
    }

    try {
      const result = await fn();

      // Record success
      this.onSuccess();

      return result;
    } catch (error) {
      // Record failure
      this.onFailure();

      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;

      if (this.successCount >= this.successThreshold) {
        console.log('[CircuitBreaker] Circuit CLOSED after recovery');
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      console.error(
        `[CircuitBreaker] Circuit OPEN after ${this.failures} failures`
      );
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED';
  }
}
