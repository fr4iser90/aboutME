# Architecture Documentation

## Project Structure

```
.
├── backend/           # FastAPI Backend
│   ├── app/
│   │   ├── api/      # API Endpoints
│   │   ├── core/     # Core Functionality
│   │   ├── domain/   # Domain Layer
│   │   ├── infrastructure/ # Infrastructure Layer
│   │   ├── schemas/  # Pydantic Schemas
│   │   └── static/   # Static Files
│   └── tests/        # Backend Tests
├── frontend/         # Next.js Frontend
│   └── src/
│       ├── app/      # Next.js App Router
│       ├── domain/   # Domain Layer
│       ├── application/ # Application Layer
│       ├── infrastructure/ # Infrastructure Layer
│       ├── presentation/ # Presentation Layer
│       ├── shared/   # Shared Components
│       └── lib/      # Utility Functions
├── database/         # Database Files
├── docs/            # Documentation
├── plans/           # Project Plans
└── scripts/         # Utility Scripts
```

## Architecture Overview

### Backend Architecture

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and business rules
- **Infrastructure Layer**: External services and implementations
- **API Layer**: HTTP endpoints and request handling

### Frontend Architecture

- **Domain Layer**: Business entities and types
- **Application Layer**: Business logic and state management
- **Infrastructure Layer**: API clients and external services
- **Presentation Layer**: UI components and pages
- **Shared Layer**: Common utilities and components

## Core Principles

- Clean Architecture
- Domain-Driven Design
- SOLID Principles
- Type Safety
- Test-Driven Development

## Implementation Details

See the following documentation for detailed implementation:

- [Backend Implementation](implementation/backend.md)
- [Frontend Implementation](implementation/frontend.md)
- [Database Implementation](implementation/database.md)
- [API Implementation](implementation/api.md)
- [Testing Implementation](implementation/testing.md)
- [Deployment Implementation](implementation/deployment.md)
- [Security Implementation](implementation/security.md)

## Development Guidelines

- Code organization
- Testing strategy
- Security practices
- Performance optimization
- Documentation standards
