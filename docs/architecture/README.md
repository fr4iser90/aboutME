# System Architecture

This document outlines the architecture of the AboutMe project, which follows Domain-Driven Design (DDD) principles with clear separation between public and admin bounded contexts.

## Project Structure

```
aboutMe/
├── backend/                    # Backend DDD Implementation
│   ├── app/
│   │   ├── api/               # API Layer
│   │   │   ├── public/        # Public API Endpoints
│   │   │   │   ├── layout.py
│   │   │   │   ├── projects.py
│   │   │   │   ├── sections.py
│   │   │   │   ├── skills.py
│   │   │   │   └── themes.py
│   │   │   └── admin/         # Admin API Endpoints
│   │   │       ├── github.py
│   │   │       ├── layout.py
│   │   │       ├── projects.py
│   │   │       ├── sections.py
│   │   │       ├── skills.py
│   │   │       └── themes.py
│   │   ├── core/              # Core Domain
│   │   │   ├── auth.py        # Authentication
│   │   │   ├── security.py    # Security
│   │   │   └── config.py      # Configuration
│   │   ├── domain/            # Domain Layer
│   │   │   ├── models/        # Domain Entities
│   │   │   ├── repositories/  # Repository Interfaces
│   │   │   └── services/      # Domain Services
│   │   ├── infrastructure/    # Infrastructure Layer
│   │   │   ├── database/      # Database Implementation
│   │   │   ├── external/      # External Services
│   │   │   └── scheduler/     # Background Tasks
│   │   └── schemas/           # API Schemas
│   └── tests/                 # Test Suite
├── frontend/                   # Frontend DDD Implementation
│   ├── src/
│   │   ├── domain/            # Domain Layer
│   │   │   ├── entities/      # Domain Entities
│   │   │   │   ├── Project.ts
│   │   │   │   ├── Skill.ts
│   │   │   │   └── Theme.ts
│   │   │   ├── repositories/  # Repository Interfaces
│   │   │   │   ├── ProjectRepository.ts
│   │   │   │   └── SkillRepository.ts
│   │   │   └── services/      # Domain Services
│   │   │       ├── ProjectService.ts
│   │   │       └── SkillService.ts
│   │   ├── application/       # Application Layer
│   │   │   ├── public/        # Public Use Cases
│   │   │   │   ├── layout/
│   │   │   │   ├── projects/
│   │   │   │   ├── sections/
│   │   │   │   ├── skills/
│   │   │   │   └── themes/
│   │   │   └── admin/         # Admin Use Cases
│   │   │       ├── github/
│   │   │       ├── layout/
│   │   │       ├── projects/
│   │   │       ├── sections/
│   │   │       ├── skills/
│   │   │       └── themes/
│   │   ├── infrastructure/    # Infrastructure Layer
│   │   │   ├── api/          # API Implementation
│   │   │   │   ├── public/
│   │   │   │   └── admin/
│   │   │   ├── storage/      # Local Storage
│   │   │   └── ui/           # UI Components
│   │   ├── presentation/     # Presentation Layer
│   │   │   ├── public/       # Public Pages
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   └── hooks/
│   │   │   └── admin/        # Admin Pages
│   │   │       ├── components/
│   │   │       ├── pages/
│   │   │       └── hooks/
│   │   └── shared/           # Shared Resources
│   │       ├── types/        # TypeScript Types
│   │       ├── utils/        # Utility Functions
│   │       └── constants/    # Constants
│   └── tests/                # Test Suite
└── docs/                     # Project Documentation
```

## Bounded Contexts

### Public Context
- **Purpose**: Public-facing content and features
- **Features**:
  - Project showcase
  - Skills display
  - Theme customization
  - Section management
- **Access**: Public read-only

### Admin Context
- **Purpose**: Content management and administration
- **Features**:
  - Project management
  - Skill management
  - Theme management
  - GitHub integration
  - Section management
- **Access**: Authenticated admin only

## Domain-Driven Design Implementation

### Backend DDD Structure

#### Domain Layer
- **Entities**: Core business objects (Project, Skill, Theme)
- **Value Objects**: Immutable objects representing concepts
- **Aggregates**: Clusters of entities treated as units
- **Domain Services**: Business logic that doesn't fit in entities
- **Repository Interfaces**: Data access abstractions

#### Application Layer
- **Public Use Cases**: Read-only operations
- **Admin Use Cases**: Full CRUD operations
- **Interface Adapters**: Convert between domain and external formats

#### Infrastructure Layer
- **Repository Implementations**: Database access
- **External Services**: Third-party integrations
- **Framework Integration**: FastAPI setup

### Frontend DDD Structure

#### Domain Layer
- **Entities**: TypeScript interfaces representing domain objects
- **Value Objects**: Immutable data structures
- **Domain Services**: Business logic and rules
- **Repository Interfaces**: Data access contracts

#### Application Layer
- **Public Use Cases**: React hooks for public features
- **Admin Use Cases**: React hooks for admin features
- **State Management**: Application state handling
- **Interface Adapters**: API and UI adapters

#### Infrastructure Layer
- **API Client**: Backend communication
- **Storage**: Local storage and caching
- **UI Components**: Reusable React components

#### Presentation Layer
- **Public Pages**: Next.js pages for public content
- **Admin Pages**: Next.js pages for admin features
- **Components**: React components
- **Hooks**: Custom React hooks

## Cross-Cutting Concerns

### Shared Domain Concepts
- Project management
- Skill tracking
- Theme customization
- User authentication

### Context Mapping
1. **Public to Admin**
   - Read-only to full access
   - Shared domain models
   - Different use cases

2. **Admin to Public**
   - Content publishing
   - Theme application
   - Section visibility

## Implementation Guidelines

### Backend
1. Keep domain logic pure
2. Use repository pattern for data access
3. Implement domain events for cross-context communication
4. Use value objects for validation

### Frontend
1. Mirror domain model in TypeScript
2. Use React hooks for use cases
3. Implement repository pattern for data access
4. Keep UI components pure

## Testing Strategy

### Backend
- Unit tests for domain logic
- Integration tests for repositories
- API tests for endpoints
- End-to-end tests for workflows

### Frontend
- Unit tests for domain logic
- Component tests for UI
- Integration tests for use cases
- End-to-end tests for user flows

## Development Workflow

### Local Development
1. Nix shell environment
2. Docker containers
3. Hot reloading
4. Type checking

### Testing
1. Unit tests
2. Integration tests
3. API tests
4. Component tests

### Deployment
1. Docker containers
2. Database migrations
3. Environment configuration
4. Health checks

## Security

### Authentication
- JWT-based authentication
- Role-based access control
- Secure session management

### Data Protection
- Input validation
- Output sanitization
- Secure communication
- Data encryption

## Monitoring

### Logging
- Application logs
- Error logs
- Access logs
- Performance metrics

### Metrics
- Response times
- Error rates
- Resource usage
- API usage
