/**
 * JSON Schema Definitions
 * 
 * Schema definitions for projects, blog posts, and about content.
 * Used for validation and Monaco Editor autocomplete.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  value?: any;
}

/**
 * Tech Stack Schema
 */
export const techStackSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    languages: {
      type: 'object',
      additionalProperties: {
        oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'null' }]
      }
    },
    frontend: { type: 'array', items: { type: 'string' } },
    backend: { type: 'array', items: { type: 'string' } },
    database: { type: 'array', items: { type: 'string' } },
    devops: { type: 'array', items: { type: 'string' } },
    testing: { type: 'array', items: { type: 'string' } },
    frameworks: { type: 'array', items: { type: 'string' } },
    libraries: { type: 'array', items: { type: 'string' } },
    tools: { type: 'array', items: { type: 'string' } },
    dependencies: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number', minimum: 0, maximum: 100 },
    summary: {
      oneOf: [{ type: 'string' }, { type: 'null' }]
    }
  }
};

/**
 * Project JSON Schema
 */
export const projectSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['id', 'name', 'description'],
  properties: {
    id: {
      oneOf: [
        { type: 'number' },
        { type: 'string' }
      ]
    },
    name: {
      type: 'string',
      minLength: 1
    },
    description: {
      type: 'string'
    },
    content: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    htmlContent: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    githubUrl: {
      oneOf: [
        { type: 'string', format: 'uri' },
        { type: 'string', maxLength: 0 },
        { type: 'null' }
      ]
    },
    homepage: {
      oneOf: [
        { type: 'string', format: 'uri' },
        { type: 'null' }
      ]
    },
    demoUrl: {
      oneOf: [
        { type: 'string', format: 'uri' },
        { type: 'null' }
      ]
    },
    language: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    stars: {
      type: 'number',
      minimum: 0
    },
    forks: {
      type: 'number',
      minimum: 0
    },
    topics: {
      type: 'array',
      items: { type: 'string' }
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    updatedAt: {
      type: 'string',
      format: 'date-time'
    },
    createdAt: {
      type: 'string',
      format: 'date-time'
    },
    size: {
      type: 'number',
      minimum: 0
    },
    featured: {
      type: 'boolean'
    },
    category: {
      type: 'string'
    },
    technologies: {
      type: 'array',
      items: { type: 'string' }
    },
    status: {
      type: 'string',
      enum: ['active', 'inactive', 'archived', 'deprecated']
    },
    difficulty: {
      type: 'string',
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    contributors: {
      type: 'number',
      minimum: 0
    },
    screenshots: {
      type: 'array',
      items: {
        oneOf: [
          { type: 'string', format: 'uri' },
          { type: 'string' },
          { type: 'null' }
        ]
      }
    },
    readme: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    longDescription: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    techStack: techStackSchema,
    techStackSummary: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    }
  }
};

/**
 * Blog Post JSON Schema
 */
export const blogPostSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['id', 'title', 'content', 'slug'],
  properties: {
    id: {
      type: 'string',
      minLength: 1
    },
    title: {
      type: 'string',
      minLength: 1
    },
    content: {
      type: 'string',
      minLength: 1
    },
    htmlContent: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    excerpt: {
      type: 'string'
    },
    publishedAt: {
      type: 'string',
      format: 'date-time'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time'
    },
    author: {
      type: 'string'
    },
    category: {
      type: 'string'
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    featured: {
      type: 'boolean'
    },
    draft: {
      type: 'boolean'
    },
    slug: {
      type: 'string',
      pattern: '^[a-zA-Z0-9-_]+$'
    },
    readingTime: {
      type: 'number',
      minimum: 0
    },
    image: {
      oneOf: [
        { type: 'string', format: 'uri' },
        { type: 'null' }
      ]
    },
    status: {
      type: 'string',
      enum: ['published', 'draft', 'archived']
    },
    difficulty: {
      type: 'string',
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    technologies: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

/**
 * About JSON Schema
 */
export const aboutSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    content: {
      type: 'string'
    },
    htmlContent: {
      oneOf: [
        { type: 'string' },
        { type: 'null' }
      ]
    },
    frontmatter: {
      type: 'object',
      additionalProperties: true
    },
    // AboutEditor / setup-wizard shapes
    header: { type: 'object', additionalProperties: true },
    sections: { type: 'array' },
    socialLinks: { type: 'object', additionalProperties: true },
    metadata: { type: 'object', additionalProperties: true },
    lastModified: {
      type: 'string'
    },
    generatedBy: {
      type: 'string'
    }
  },
  additionalProperties: true
};

/** Index / list files — accept object or array shapes */
export const projectsIndexSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  oneOf: [
    {
      type: 'object',
      properties: {
        projects: { type: 'array' },
        lastUpdated: { type: 'string' },
        totalCount: { type: 'number' }
      },
      additionalProperties: true
    },
    { type: 'array' }
  ]
};

/** Passthrough for config/user/skills/etc. */
export const permissiveObjectSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  additionalProperties: true
};

/**
 * Schema mapping by content type
 */
export const schemaMap: Record<string, any> = {
  project: projectSchema,
  projects: projectSchema,
  blog: blogPostSchema,
  blogPost: blogPostSchema,
  about: aboutSchema
};

/**
 * Get schema for content type
 */
export function getSchema(contentType: string): any {
  return schemaMap[contentType] || {};
}

/**
 * Get schema for file path
 */
export function getSchemaForPath(filePath: string): any {
  const normalized = filePath.replace(/\\/g, '/');

  // Index / aggregate files (not single project details)
  if (
    normalized.endsWith('/projects/projects.json') ||
    normalized.endsWith('/projects.json') ||
    normalized.endsWith('/blog/blog.json') ||
    normalized.endsWith('/blog.json')
  ) {
    return projectsIndexSchema;
  }

  if (normalized.includes('/projects/details/') || normalized.includes('/projects/')) {
    // Single project detail objects
    if (normalized.endsWith('projects.json')) {
      return projectsIndexSchema;
    }
    return projectSchema;
  }
  if (normalized.includes('/blog/posts/') || normalized.includes('/blog/')) {
    if (normalized.endsWith('blog.json')) {
      return projectsIndexSchema;
    }
    return blogPostSchema;
  }
  if (normalized.includes('/about/')) {
    return aboutSchema;
  }
  if (
    normalized.includes('/user/') ||
    normalized.includes('/config/') ||
    normalized.includes('/skills/') ||
    normalized.includes('/timeline/') ||
    normalized.includes('/terminal/')
  ) {
    return permissiveObjectSchema;
  }
  return permissiveObjectSchema;
}

