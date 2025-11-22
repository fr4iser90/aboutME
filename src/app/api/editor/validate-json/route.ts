/**
 * JSON Validation API Route
 * 
 * Validates JSON content against schema.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsonValidator } from '@/features/editor/services/jsonValidator';
import { getSchema, getSchemaForPath } from '@/features/editor/services/jsonSchema';

/**
 * POST: Validate JSON content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, contentType, filePath } = body;
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Get schema
    let schema: any;
    if (filePath) {
      schema = getSchemaForPath(filePath);
    } else if (contentType) {
      schema = getSchema(contentType);
    } else {
      return NextResponse.json(
        { error: 'Either contentType or filePath is required' },
        { status: 400 }
      );
    }
    
    if (!schema || Object.keys(schema).length === 0) {
      return NextResponse.json(
        { error: 'No schema found for validation' },
        { status: 400 }
      );
    }
    
    // Parse JSON
    let data: any;
    try {
      data = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          message: parseError instanceof Error ? parseError.message : 'Parse error',
          validation: {
            isValid: false,
            errors: [{
              path: '/',
              message: parseError instanceof Error ? parseError.message : 'JSON parse error',
              value: content
            }]
          }
        },
        { status: 400 }
      );
    }
    
    // Validate against schema
    const validationResult = jsonValidator.validate(data, schema);
    
    return NextResponse.json({
      validation: validationResult,
      schema: {
        type: contentType || (filePath ? 'auto-detected' : 'unknown'),
        path: filePath || null
      }
    });
    
  } catch (error) {
    console.error('JSON validation API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

