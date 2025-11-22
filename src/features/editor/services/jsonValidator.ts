/**
 * JSON Schema Validation Service
 * 
 * Validates JSON data against JSON Schema definitions.
 * Uses ajv for validation with error formatting.
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { getSchema, getSchemaForPath, ValidationResult, ValidationError } from './jsonSchema';
import { jsonValidationLogger } from './jsonValidationLogger';

// Server-only imports (fs and path are only available on the server)
let fs: typeof import('fs').promises;
let path: typeof import('path');

// Lazy load fs and path only on server side
if (typeof window === 'undefined') {
  fs = require('fs').promises;
  path = require('path');
}

class JSONValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      validateFormats: true
    });
    
    // Add format validators (uri, date-time, etc.)
    addFormats(this.ajv);
  }

  /**
   * Validate JSON data against schema
   */
  validate(data: any, schema: any): ValidationResult {
    try {
      const validate = this.ajv.compile(schema);
      const isValid = validate(data);
      
      if (isValid) {
        return {
          isValid: true,
          errors: []
        };
      }

      const errors: ValidationError[] = (validate.errors || []).map((error: any) => ({
        path: error.instancePath || error.schemaPath || '/',
        message: error.message || 'Validation error',
        value: error.data
      }));

      return {
        isValid: false,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          path: '/',
          message: error instanceof Error ? error.message : 'Unknown validation error',
          value: data
        }]
      };
    }
  }

  /**
   * Validate JSON file against schema
   * NOTE: This method is server-only and requires fs/path modules
   */
  async validateFile(filePath: string, schema?: any): Promise<ValidationResult> {
    // Check if we're on the server
    if (typeof window !== 'undefined') {
      return {
        isValid: false,
        errors: [{
          path: '/',
          message: 'validateFile is only available on the server. Use validateString or the API endpoint instead.',
          value: null
        }]
      };
    }

    try {
      // Ensure fs and path are loaded
      if (!fs || !path) {
        fs = require('fs').promises;
        path = require('path');
      }

      // Get schema from path if not provided
      if (!schema) {
        schema = getSchemaForPath(filePath);
      }

      if (!schema || Object.keys(schema).length === 0) {
        return {
          isValid: false,
          errors: [{
            path: '/',
            message: `No schema found for file: ${filePath}`,
            value: null
          }]
        };
      }

      // Read and parse JSON file
      const content = await fs.readFile(filePath, 'utf-8');
      let data: any;
      
      try {
        data = JSON.parse(content);
      } catch (parseError) {
        return {
          isValid: false,
          errors: [{
            path: '/',
            message: `Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Parse error'}`,
            value: content
          }]
        };
      }

      // Validate against schema
      const result = this.validate(data, schema);
      
      // Log validation result
      jsonValidationLogger.log(filePath, result);
      
      return result;
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          path: '/',
          message: error instanceof Error ? error.message : 'File validation error',
          value: null
        }]
      };
    }
  }

  /**
   * Validate multiple JSON files
   */
  async validateAllFiles(
    files: string[],
    schema?: any
  ): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();

    for (const filePath of files) {
      const result = await this.validateFile(filePath, schema);
      results.set(filePath, result);
    }

    return results;
  }

  /**
   * Validate JSON string
   */
  validateString(jsonString: string, schema: any, filePath?: string): ValidationResult {
    try {
      const data = JSON.parse(jsonString);
      const result = this.validate(data, schema);
      
      // Log validation result if filePath provided
      if (filePath) {
        jsonValidationLogger.log(filePath, result);
      }
      
      return result;
    } catch (error) {
      const result = {
        isValid: false,
        errors: [{
          path: '/',
          message: error instanceof Error ? error.message : 'JSON parse error',
          value: jsonString
        }]
      };
      
      // Log validation result if filePath provided
      if (filePath) {
        jsonValidationLogger.log(filePath, result);
      }
      
      return result;
    }
  }

  /**
   * Get formatted error message
   */
  formatError(error: ValidationError): string {
    const path = error.path === '/' ? 'root' : error.path;
    return `${path}: ${error.message}`;
  }

  /**
   * Get all formatted error messages
   */
  formatErrors(errors: ValidationError[]): string[] {
    return errors.map(error => this.formatError(error));
  }
}

// Export singleton instance
export const jsonValidator = new JSONValidator();

// Export class for testing
export { JSONValidator };

// Export types
export type { ValidationResult, ValidationError };

