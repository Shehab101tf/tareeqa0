/**
 * Result Type System for Tareeqa POS
 * Functional error handling without exceptions
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

export interface Failure<E> {
  readonly success: false;
  readonly error: E;
}

/**
 * Create a successful result
 */
export const Ok = <T>(data: T): Success<T> => ({
  success: true,
  data
});

/**
 * Create a failed result
 */
export const Err = <E>(error: E): Failure<E> => ({
  success: false,
  error
});

/**
 * Result utility functions
 */
export class ResultUtils {
  /**
   * Check if result is successful
   */
  static isOk<T, E>(result: Result<T, E>): result is Success<T> {
    return result.success === true;
  }

  /**
   * Check if result is failed
   */
  static isErr<T, E>(result: Result<T, E>): result is Failure<E> {
    return result.success === false;
  }

  /**
   * Map over successful result
   */
  static map<T, U, E>(
    result: Result<T, E>,
    fn: (data: T) => U
  ): Result<U, E> {
    if (ResultUtils.isOk(result)) {
      return Ok(fn(result.data));
    }
    return result;
  }

  /**
   * Map over failed result
   */
  static mapErr<T, E, F>(
    result: Result<T, E>,
    fn: (error: E) => F
  ): Result<T, F> {
    if (ResultUtils.isErr(result)) {
      return Err(fn(result.error));
    }
    return result;
  }

  /**
   * Chain operations on successful results
   */
  static flatMap<T, U, E>(
    result: Result<T, E>,
    fn: (data: T) => Result<U, E>
  ): Result<U, E> {
    if (ResultUtils.isOk(result)) {
      return fn(result.data);
    }
    return result;
  }

  /**
   * Get data or default value
   */
  static unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    if (ResultUtils.isOk(result)) {
      return result.data;
    }
    return defaultValue;
  }

  /**
   * Get data or throw error
   */
  static unwrap<T, E>(result: Result<T, E>): T {
    if (ResultUtils.isOk(result)) {
      return result.data;
    }
    throw result.error;
  }

  /**
   * Combine multiple results
   */
  static combine<T extends readonly unknown[], E>(
    results: { [K in keyof T]: Result<T[K], E> }
  ): Result<T, E> {
    const data: unknown[] = [];
    
    for (const result of results) {
      if (ResultUtils.isErr(result)) {
        return result;
      }
      data.push(result.data);
    }
    
    return Ok(data as T);
  }

  /**
   * Convert Promise to Result
   */
  static async fromPromise<T>(
    promise: Promise<T>
  ): Promise<Result<T, Error>> {
    try {
      const data = await promise;
      return Ok(data);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Convert function that might throw to Result
   */
  static fromThrowable<T, Args extends unknown[]>(
    fn: (...args: Args) => T
  ): (...args: Args) => Result<T, Error> {
    return (...args: Args) => {
      try {
        const data = fn(...args);
        return Ok(data);
      } catch (error) {
        return Err(error instanceof Error ? error : new Error(String(error)));
      }
    };
  }

  /**
   * Filter successful results
   */
  static filter<T, E>(
    results: Result<T, E>[],
    predicate: (data: T) => boolean
  ): T[] {
    return results
      .filter(ResultUtils.isOk)
      .map(result => result.data)
      .filter(predicate);
  }

  /**
   * Partition results into successes and failures
   */
  static partition<T, E>(
    results: Result<T, E>[]
  ): { successes: T[]; failures: E[] } {
    const successes: T[] = [];
    const failures: E[] = [];

    for (const result of results) {
      if (ResultUtils.isOk(result)) {
        successes.push(result.data);
      } else {
        failures.push(result.error);
      }
    }

    return { successes, failures };
  }
}

/**
 * Application-specific error types
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly messageArabic?: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      messageArabic: this.messageArabic,
      code: this.code,
      context: this.context,
      stack: this.stack
    };
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field?: string,
    messageArabic?: string
  ) {
    super(message, 'VALIDATION_ERROR', messageArabic, { field });
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    public readonly query?: string,
    messageArabic?: string
  ) {
    super(message, 'DATABASE_ERROR', messageArabic, { query });
    this.name = 'DatabaseError';
  }
}

export class SecurityError extends AppError {
  constructor(
    message: string,
    public readonly severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    messageArabic?: string
  ) {
    super(message, 'SECURITY_ERROR', messageArabic, { severity });
    this.name = 'SecurityError';
  }
}

export class HardwareError extends AppError {
  constructor(
    message: string,
    public readonly deviceType?: string,
    messageArabic?: string
  ) {
    super(message, 'HARDWARE_ERROR', messageArabic, { deviceType });
    this.name = 'HardwareError';
  }
}

export class LicenseError extends AppError {
  constructor(
    message: string,
    public readonly licenseStatus?: string,
    messageArabic?: string
  ) {
    super(message, 'LICENSE_ERROR', messageArabic, { licenseStatus });
    this.name = 'LicenseError';
  }
}

/**
 * Result type aliases for common operations
 */
export type DatabaseResult<T> = Result<T, DatabaseError>;
export type ValidationResult<T> = Result<T, ValidationError>;
export type SecurityResult<T> = Result<T, SecurityError>;
export type HardwareResult<T> = Result<T, HardwareError>;
export type LicenseResult<T> = Result<T, LicenseError>;

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed',
  errorMessageArabic: string = 'فشلت العملية'
): Promise<Result<T, AppError>> {
  try {
    const result = await operation();
    return Ok(result);
  } catch (error) {
    console.error('Safe async operation failed:', error);
    
    if (error instanceof AppError) {
      return Err(error);
    }
    
    return Err(new AppError(
      errorMessage,
      'ASYNC_ERROR',
      errorMessageArabic,
      { originalError: error }
    ));
  }
}

/**
 * Safe sync operation wrapper
 */
export function safe<T>(
  operation: () => T,
  errorMessage: string = 'Operation failed',
  errorMessageArabic: string = 'فشلت العملية'
): Result<T, AppError> {
  try {
    const result = operation();
    return Ok(result);
  } catch (error) {
    console.error('Safe sync operation failed:', error);
    
    if (error instanceof AppError) {
      return Err(error);
    }
    
    return Err(new AppError(
      errorMessage,
      'SYNC_ERROR',
      errorMessageArabic,
      { originalError: error }
    ));
  }
}
