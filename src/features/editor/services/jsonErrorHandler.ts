/**
 * JSON Error Handler
 * 
 * Custom error types and error handling for JSON operations.
 */

export class FileNotFoundError extends Error {
  constructor(filePath: string) {
    super(`File not found: ${filePath}`);
    this.name = 'FileNotFoundError';
  }
}

export class InvalidJSONError extends Error {
  constructor(message: string, public parseError?: Error) {
    super(`Invalid JSON: ${message}`);
    this.name = 'InvalidJSONError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public validationErrors: Array<{ path: string; message: string }>
  ) {
    super(`Validation failed: ${message}`);
    this.name = 'ValidationError';
  }
}

export class PermissionError extends Error {
  constructor(filePath: string) {
    super(`Permission denied: ${filePath}`);
    this.name = 'PermissionError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(`Network error: ${message}`);
    this.name = 'NetworkError';
  }
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: Error): string {
  if (error instanceof FileNotFoundError) {
    return `File not found. Please check the file path.`;
  }
  
  if (error instanceof InvalidJSONError) {
    return `Invalid JSON format: ${error.message}`;
  }
  
  if (error instanceof ValidationError) {
    const errorCount = error.validationErrors.length;
    return `Validation failed with ${errorCount} error(s). Please check the JSON structure.`;
  }
  
  if (error instanceof PermissionError) {
    return `Permission denied. You don't have access to this file.`;
  }
  
  if (error instanceof NetworkError) {
    return `Network error: ${error.message}. Please try again.`;
  }
  
  return `An error occurred: ${error.message}`;
}

/**
 * Log error with context
 */
export function logError(error: Error, context?: Record<string, any>): void {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context
  };
  
  console.error('JSON Operation Error:', errorInfo);
  
  // Additional logging for specific error types
  if (error instanceof ValidationError) {
    console.error('Validation Errors:', error.validationErrors);
  }
  
  if (error instanceof InvalidJSONError && error.parseError) {
    console.error('Parse Error:', error.parseError);
  }
}

