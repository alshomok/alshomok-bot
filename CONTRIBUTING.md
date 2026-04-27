# Contributing to Student Assistant

Thank you for your interest in contributing to Student Assistant! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your credentials
4. Run the development server: `npm run dev`

## Code Style

- **TypeScript**: All code must be typed
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Clean Architecture**: Maintain separation between domain, infrastructure, and presentation layers

## Project Structure Guidelines

```
src/
├── app/              # Next.js pages and API routes
├── components/       # React components
│   ├── features/     # Feature-specific components
│   ├── layouts/      # Layout components
│   └── ui/           # Reusable UI components
├── domain/           # Domain layer (Clean Architecture)
│   ├── entities/     # Business entities
│   ├── repositories/ # Repository interfaces
│   └── use-cases/    # Business logic
├── infrastructure/   # Infrastructure layer
│   ├── supabase/     # Supabase clients
│   ├── telegram/     # Telegram bot
│   └── database/     # Repository implementations
├── lib/              # Utilities and helpers
└── shared/           # Shared constants and types
```

## Commit Guidelines

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add file upload progress indicator`

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Ensure all tests pass (when added)
4. Update documentation if needed
5. Submit a pull request with a clear description

## Testing

- Test your changes locally
- Ensure TypeScript compiles without errors
- Verify no secrets are committed

## Questions?

Open an issue for questions or discussion.
