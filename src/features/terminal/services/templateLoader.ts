/**
 * Terminal Template Loader Service
 * 
 * Loads terminal template files and replaces variables with user-provided values.
 * Supports all 6 terminal template files:
 * - terminal-user-info.json.template
 * - terminal-commands.json.template
 * - terminal.json.template
 * - fake-os-structure.json.template
 * - permission-rules.json.template
 * - puzzle-files.json.template
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Template variables interface
 */
export interface TemplateVariables {
  USERNAME: string;
  HOSTNAME: string;
  PASSWORD_USER: string;
  PASSWORD_ROOT: string;
  PASSWORD_HINT?: string;
  ROOT_PASSWORD_HINT?: string;
}

/**
 * Terminal file names (without .template extension)
 */
const TERMINAL_TEMPLATE_FILES = [
  'terminal-user-info.json',
  'terminal-commands.json',
  'terminal.json',
  'fake-os-structure.json',
  'permission-rules.json',
  'puzzle-files.json'
] as const;

/**
 * Terminal Template Loader class
 */
export class TerminalTemplateLoader {
  private templateDir: string;
  private cache: Map<string, string> = new Map();

  /**
   * Create a new TerminalTemplateLoader instance
   * @param templateDir Optional custom template directory path
   */
  constructor(templateDir?: string) {
    if (templateDir) {
      this.templateDir = templateDir;
    } else {
      // Default to src/features/terminal/templates/
      this.templateDir = path.join(
        process.cwd(),
        'src',
        'features',
        'terminal',
        'templates'
      );
    }
  }

  /**
   * Load a template file from disk
   * @param templateName Name of template file (without .template extension)
   * @returns Template file content as string
   * @throws Error if template file not found or cannot be read
   */
  async loadTemplate(templateName: string): Promise<string> {
    const cacheKey = templateName;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const templatePath = path.join(
      this.templateDir,
      `${templateName}.template`
    );

    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      this.cache.set(cacheKey, content);
      return content;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(
          `Template file not found: ${templatePath}. Make sure the template exists.`
        );
      }
      throw new Error(
        `Failed to load template ${templateName}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Replace template variables in content with actual values
   * @param content Template content with variables
   * @param variables Variable values to replace
   * @returns Content with variables replaced
   */
  replaceVariables(content: string, variables: TemplateVariables): string {
    let result = content;

    // Replace all occurrences of each variable
    result = result.replace(/\{\{USERNAME\}\}/g, variables.USERNAME);
    result = result.replace(/\{\{HOSTNAME\}\}/g, variables.HOSTNAME);
    result = result.replace(/\{\{PASSWORD_USER\}\}/g, variables.PASSWORD_USER);
    result = result.replace(/\{\{PASSWORD_ROOT\}\}/g, variables.PASSWORD_ROOT);
    
    // Optional variables with fallback to empty string
    result = result.replace(
      /\{\{PASSWORD_HINT\}\}/g,
      variables.PASSWORD_HINT || ''
    );
    result = result.replace(
      /\{\{ROOT_PASSWORD_HINT\}\}/g,
      variables.ROOT_PASSWORD_HINT || ''
    );

    return result;
  }

  /**
   * Generate JSON data from a template
   * @param templateName Name of template file (without .template extension)
   * @param variables Variable values to replace
   * @returns Parsed JSON object
   * @throws Error if template loading, variable replacement, or JSON parsing fails
   */
  async generateFromTemplate(
    templateName: string,
    variables: TemplateVariables
  ): Promise<any> {
    try {
      // Load template
      const templateContent = await this.loadTemplate(templateName);

      // Replace variables
      const replacedContent = this.replaceVariables(templateContent, variables);

      // Parse JSON
      try {
        return JSON.parse(replacedContent);
      } catch (parseError) {
        throw new Error(
          `Failed to parse JSON from template ${templateName}: ${parseError instanceof Error ? parseError.message : String(parseError)}`
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to generate data from template ${templateName}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate all 6 terminal files from templates
   * @param variables Variable values to replace
   * @returns Object with file names as keys and generated JSON data as values
   * @throws Error if any template generation fails
   */
  async generateAllTerminalFiles(
    variables: TemplateVariables
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    const errors: string[] = [];

    for (const templateName of TERMINAL_TEMPLATE_FILES) {
      try {
        results[templateName] = await this.generateFromTemplate(
          templateName,
          variables
        );
      } catch (error) {
        const errorMessage = `Failed to generate ${templateName}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMessage);
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `Template generation failed for ${errors.length} file(s):\n${errors.join('\n')}`
      );
    }

    return results;
  }

  /**
   * Validate that all required variables are provided
   * @param variables Variables to validate
   * @returns Validation result with errors array
   */
  validateVariables(variables: Partial<TemplateVariables>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!variables.USERNAME || typeof variables.USERNAME !== 'string') {
      errors.push('USERNAME is required and must be a string');
    }

    if (!variables.HOSTNAME || typeof variables.HOSTNAME !== 'string') {
      errors.push('HOSTNAME is required and must be a string');
    }

    if (!variables.PASSWORD_USER || typeof variables.PASSWORD_USER !== 'string') {
      errors.push('PASSWORD_USER is required and must be a string');
    }

    if (!variables.PASSWORD_ROOT || typeof variables.PASSWORD_ROOT !== 'string') {
      errors.push('PASSWORD_ROOT is required and must be a string');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get list of all terminal template file names
   * @returns Array of template file names
   */
  static getTemplateFiles(): readonly string[] {
    return TERMINAL_TEMPLATE_FILES;
  }
}

