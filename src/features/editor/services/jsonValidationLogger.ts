/**
 * JSON Validation Logger
 * 
 * Tracks validation results and statistics over time.
 */

import { ValidationResult } from './jsonValidator';

interface ValidationLogEntry {
  timestamp: string;
  filePath: string;
  isValid: boolean;
  errorCount: number;
  errors: Array<{ path: string; message: string }>;
}

interface ValidationStatistics {
  totalValidations: number;
  validCount: number;
  invalidCount: number;
  errorFrequency: Map<string, number>;
  fileValidationHistory: Map<string, ValidationLogEntry[]>;
}

class JSONValidationLogger {
  private logs: ValidationLogEntry[] = [];
  private statistics: ValidationStatistics = {
    totalValidations: 0,
    validCount: 0,
    invalidCount: 0,
    errorFrequency: new Map(),
    fileValidationHistory: new Map()
  };
  
  private readonly maxLogEntries = 1000; // Keep last 1000 entries
  
  /**
   * Log validation result
   */
  log(filePath: string, result: ValidationResult): void {
    const entry: ValidationLogEntry = {
      timestamp: new Date().toISOString(),
      filePath,
      isValid: result.isValid,
      errorCount: result.errors.length,
      errors: result.errors.map(e => ({
        path: e.path,
        message: e.message
      }))
    };
    
    // Add to logs
    this.logs.push(entry);
    
    // Keep only last N entries
    if (this.logs.length > this.maxLogEntries) {
      this.logs.shift();
    }
    
    // Update statistics
    this.statistics.totalValidations++;
    if (result.isValid) {
      this.statistics.validCount++;
    } else {
      this.statistics.invalidCount++;
      
      // Track error frequency
      result.errors.forEach(error => {
        const key = `${error.path}:${error.message}`;
        const count = this.statistics.errorFrequency.get(key) || 0;
        this.statistics.errorFrequency.set(key, count + 1);
      });
    }
    
    // Track file validation history
    if (!this.statistics.fileValidationHistory.has(filePath)) {
      this.statistics.fileValidationHistory.set(filePath, []);
    }
    const fileHistory = this.statistics.fileValidationHistory.get(filePath)!;
    fileHistory.push(entry);
    
    // Keep only last 50 entries per file
    if (fileHistory.length > 50) {
      fileHistory.shift();
    }
  }
  
  /**
   * Get validation statistics
   */
  getStatistics(): ValidationStatistics {
    return {
      ...this.statistics,
      errorFrequency: new Map(this.statistics.errorFrequency),
      fileValidationHistory: new Map(this.statistics.fileValidationHistory)
    };
  }
  
  /**
   * Get validation history for a file
   */
  getFileHistory(filePath: string): ValidationLogEntry[] {
    return this.statistics.fileValidationHistory.get(filePath) || [];
  }
  
  /**
   * Get recent validation logs
   */
  getRecentLogs(limit: number = 100): ValidationLogEntry[] {
    return this.logs.slice(-limit);
  }
  
  /**
   * Get most common errors
   */
  getMostCommonErrors(limit: number = 10): Array<{ error: string; count: number }> {
    const errors = Array.from(this.statistics.errorFrequency.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return errors;
  }
  
  /**
   * Clear all logs and statistics
   */
  clear(): void {
    this.logs = [];
    this.statistics = {
      totalValidations: 0,
      validCount: 0,
      invalidCount: 0,
      errorFrequency: new Map(),
      fileValidationHistory: new Map()
    };
  }
  
  /**
   * Get validation report
   */
  getReport(): {
    statistics: ValidationStatistics;
    recentLogs: ValidationLogEntry[];
    mostCommonErrors: Array<{ error: string; count: number }>;
  } {
    return {
      statistics: this.getStatistics(),
      recentLogs: this.getRecentLogs(50),
      mostCommonErrors: this.getMostCommonErrors(10)
    };
  }
}

// Export singleton instance
export const jsonValidationLogger = new JSONValidationLogger();

// Export class for testing
export { JSONValidationLogger };

