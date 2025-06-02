# Clean Architecture

## Overview

The project follows Clean Architecture principles to maintain separation of concerns and independence of frameworks.

## Layers

### Domain Layer

```
backend/app/domain/
├── models/      # Domain entities
├── repositories/# Repository interfaces
└── services/   # Business logic
```

- Core business rules
- Enterprise business rules
- Independent of frameworks
- No dependencies on other layers

### Application Layer

```
backend/app/core/
├── config/     # Application configuration
├── security/   # Security implementation
└── utils/      # Utility functions
```

- Use cases
- Business rules
- Orchestration
- No framework dependencies

### Infrastructure Layer

```
backend/app/infrastructure/
├── database/   # Database implementation
├── repositories/# Repository implementations
└── services/   # External services
```

- Framework implementations
- Database access
- External services
- Technical details

### Presentation Layer

```
frontend/src/presentation/
├── components/ # UI components
├── pages/      # Page components
└── layouts/    # Layout components
```

- UI components
- User interface
- Framework specific
- User interaction

## Dependencies

- Dependencies point inward
- Inner layers don't know about outer layers
- Domain layer has no dependencies
- Infrastructure depends on domain

## Implementation

### Backend

- FastAPI for API layer
- SQLAlchemy for database
- Pydantic for validation
- Dependency injection

### Frontend

- Next.js for framework
- React for UI
- TypeScript for types
- State management 