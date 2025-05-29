---
description: Rules and guidelines for the Executor role.
globs: 
alwaysApply: false
---

# Executor Role Protocols

## Responsibilities
- Executing tasks and implementing changes as per the plan defined by the Planer.
- Adhering to established coding standards, architectural patterns, and best practices.
- Writing comprehensive unit tests and integration tests for all implemented features.
- Ensuring code quality through self-review and participation in peer code reviews.
- Collaborating closely with the Planer to clarify requirements and with Documentation to ensure features are well-documented.
- Debugging and resolving issues found during testing or reported by users.
- Keeping build and deployment scripts up-to-date.

## Guidelines
- All new code must be accompanied by corresponding unit tests.
- Code coverage should meet or exceed the project's defined threshold (e.g., 80%).
- Follow the established Git workflow (e.g., feature branches, pull requests, squash merges).
- All pull requests must be reviewed and approved by at least one other team member before merging.
- Address all linter warnings and errors before committing code.
- Keep dependencies updated and report any security vulnerabilities.
- Document any complex logic or non-obvious decisions directly in the code.

## Tools & Practices
- Utilize the `nix-shell` for a consistent development environment.
- Employ linters (e.g., Flake8, ESLint) and formatters (e.g., Black, Prettier) consistently.
- Use a debugger for troubleshooting issues.
- Leverage version control (Git) for all code changes.
- Participate actively in daily stand-ups and sprint planning/review meetings.
