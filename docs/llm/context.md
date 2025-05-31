# LLM Context Management

This document defines how to maintain and provide context for LLM operations in the AboutMe project.

## Context Types

### Project Context
- Project structure
- Technology stack
- Dependencies
- Configuration
- Environment setup

### Code Context
- File structure
- Code patterns
- Naming conventions
- Type definitions
- Error handling

### Domain Context
- Business logic
- Data models
- API contracts
- Security requirements
- Performance requirements

## Context Provision

### File Structure
```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   └── domain/
└── docs/
    └── llm/
        ├── prompts/
        └── context.md
```

### Context Markers
```markdown
<!-- CONTEXT:START -->
[Context Information]
<!-- CONTEXT:END -->

<!-- REQUIREMENTS:START -->
[Requirements]
<!-- REQUIREMENTS:END -->

<!-- CONSTRAINTS:START -->
[Constraints]
<!-- CONSTRAINTS:END -->
```

## Context Management

### Pre-Operation
1. Gather relevant context
2. Verify context completeness
3. Update context if needed
4. Validate context against requirements

### During Operation
1. Maintain context state
2. Track context changes
3. Handle context updates
4. Log context modifications

### Post-Operation
1. Verify context integrity
2. Update context documentation
3. Log context changes
4. Clean up temporary context

## Context Validation

### Required Fields
- Operation type
- Component scope
- Dependencies
- Constraints
- Requirements

### Validation Rules
1. Context completeness
2. Context consistency
3. Context relevance
4. Context accuracy

## Context Storage

### Local Storage
- File-based context
- Environment variables
- Configuration files
- Documentation

### Remote Storage
- Version control
- Documentation system
- Knowledge base
- API documentation

## Context Updates

### Automatic Updates
- Code changes
- Documentation updates
- Configuration changes
- Dependency updates

### Manual Updates
- Business requirements
- Security updates
- Performance optimizations
- Architecture changes

## Best Practices

### Context Provision
1. Be specific
2. Be complete
3. Be relevant
4. Be accurate

### Context Management
1. Regular updates
2. Version control
3. Documentation
4. Validation

### Context Usage
1. Verify context
2. Update context
3. Log changes
4. Clean up

## Troubleshooting

### Common Issues
1. Missing context
2. Outdated context
3. Inconsistent context
4. Invalid context

### Resolution Steps
1. Identify issue
2. Gather missing context
3. Update context
4. Verify resolution 