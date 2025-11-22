/**
 * JSON Editor Component
 * 
 * Monaco Editor-based JSON editor with schema validation and autocomplete.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { jsonValidator, ValidationResult } from '../services/jsonValidator';
import { getSchemaForPath } from '../services/jsonSchema';

interface JSONEditorProps {
  filePath: string;
  schema?: any;
  initialContent?: string;
  onSave?: (content: string) => void;
  onValidate?: (result: ValidationResult) => void;
  onChange?: (content: string) => void;
  readOnly?: boolean;
  height?: string;
}

export default function JSONEditor({
  filePath,
  schema,
  initialContent,
  onSave,
  onValidate,
  onChange,
  readOnly = false,
  height = '600px'
}: JSONEditorProps) {
  const [content, setContent] = useState<string>(initialContent || '');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSyntaxError, setHasSyntaxError] = useState(false);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get schema from path if not provided
  const effectiveSchema = schema || getSchemaForPath(filePath);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    // Clear previous timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    if (content && effectiveSchema && Object.keys(effectiveSchema).length > 0) {
      // Check for syntax errors first
      try {
        JSON.parse(content);
        setHasSyntaxError(false);
        setSyntaxError(null);
      } catch (parseError) {
        setHasSyntaxError(true);
        setSyntaxError(parseError instanceof Error ? parseError.message : 'Invalid JSON');
      }

      // Debounced validation
      validationTimeoutRef.current = setTimeout(() => {
        validateContent(content);
      }, 300);
    }

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [content, effectiveSchema]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure JSON language with schema
    if (effectiveSchema && Object.keys(effectiveSchema).length > 0) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: `http://schema/${filePath}`,
            fileMatch: [filePath],
            schema: effectiveSchema
          }
        ],
        allowComments: false,
        trailingCommas: 'ignore'
      });
    }

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Format first, then save
      editor.getAction('editor.action.formatDocument')?.run();
      setTimeout(() => handleSave(), 100);
    });

    // Add undo/redo shortcuts (already built-in, but ensure they work)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
      editor.trigger('keyboard', 'undo', null);
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyY, () => {
      editor.trigger('keyboard', 'redo', null);
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, () => {
      editor.trigger('keyboard', 'redo', null);
    });

    // Search and replace shortcuts (already built-in)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      editor.getAction('actions.find')?.run();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      editor.getAction('editor.action.startFindReplaceAction')?.run();
    });
  };

  const validateContent = (jsonContent: string) => {
    if (!jsonContent.trim()) {
      return;
    }

    setIsValidating(true);
    
    // Debounce validation for better performance
    const timeoutId = setTimeout(() => {
      try {
        const result = jsonValidator.validateString(jsonContent, effectiveSchema, filePath);
        setValidationResult(result);
        
        if (onValidate) {
          onValidate(result);
        }
      } catch (error) {
        const errorResult: ValidationResult = {
          isValid: false,
          errors: [{
            path: '/',
            message: error instanceof Error ? error.message : 'Validation error',
            value: jsonContent
          }]
        };
        setValidationResult(errorResult);
        
        if (onValidate) {
          onValidate(errorResult);
        }
      } finally {
        setIsValidating(false);
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  };

  const handleChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Validate before saving
      const result = jsonValidator.validateString(content, effectiveSchema);
      
      if (!result.isValid) {
        setValidationResult(result);
        if (onValidate) {
          onValidate(result);
        }
        setIsSaving(false);
        return;
      }

      if (onSave) {
        await onSave(content);
      }
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDocument = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div className="json-editor">
      <div className="json-editor__toolbar">
        <div className="json-editor__status">
          {isValidating && <span className="json-editor__status-item">Validating...</span>}
          {validationResult && (
            <span className={`json-editor__status-item ${validationResult.isValid ? 'json-editor__status-item--valid' : 'json-editor__status-item--invalid'}`}>
              {validationResult.isValid ? '✓ Valid' : `✗ ${validationResult.errors.length} error(s)`}
            </span>
          )}
          {isSaving && <span className="json-editor__status-item">Saving...</span>}
        </div>
        <div className="json-editor__actions">
          <button
            onClick={formatDocument}
            className="json-editor__button"
            title="Format JSON (Shift+Alt+F)"
          >
            Format
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="json-editor__button json-editor__button--primary"
            title="Save (Ctrl+S)"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {(hasSyntaxError || (validationResult && !validationResult.isValid)) && (
        <div className="json-editor__errors">
          {hasSyntaxError && (
            <div className="json-editor__error-section">
              <h4>Syntax Error:</h4>
              <p className="json-editor__error-message">{syntaxError}</p>
            </div>
          )}
          {validationResult && !validationResult.isValid && (
            <div className="json-editor__error-section">
              <h4>Validation Errors ({validationResult.errors.length}):</h4>
              <ul>
                {validationResult.errors.map((error, index) => (
                  <li 
                    key={index}
                    className="json-editor__error-item"
                    onClick={() => {
                      // Jump to error location in editor
                      if (editorRef.current && error.path !== '/') {
                        // Try to find the line number from path
                        const pathParts = error.path.split('/').filter(Boolean);
                        // Simple implementation - could be improved
                        editorRef.current.revealLine(1);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <strong>{error.path === '/' ? 'root' : error.path}</strong>: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Editor
        height={height}
        language="json"
        value={content}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: false,
          tabSize: 2,
          wordWrap: 'on',
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'always',
          matchBrackets: 'always',
          autoIndent: 'full',
          suggest: {
            showWords: false,
            showSnippets: true
          }
        }}
        theme="vs-dark"
      />
    </div>
  );
}

