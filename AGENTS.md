# AGENTS.md

Developer documentation for AI agents working on the Onward project.

## Project Overview

**Onward** is a professional development platform designed to empower teachers with flexible, personalized, and bite-sized learning resources. The platform delivers practical growth opportunities that fit seamlessly into busy teaching schedules.

### Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) (v2) with Svelte 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Caching**: Valkey (Redis-compatible)
- **Storage**: S3-compatible object storage (MinIO for local development)
- **Vector Database**: Weaviate for embeddings and semantic search
- **AI Integration**: OpenAI API
- **Authentication**: Google OAuth2
- **Testing**: Vitest with Testing Library
- **Package Manager**: pnpm (workspace-based monorepo)

### Project Structure

```
.
├── prisma/          # Database schema and migrations
├── src/             # SvelteKit application source code
├── patches/         # pnpm package patches
└── [config files]   # Various configuration files for tools
```

## Build and Test Commands

All commands should be run from the project root using `pnpm`:

| Command            | Description                                    |
| :----------------- | :--------------------------------------------- |
| `pnpm install`     | Install all project dependencies               |
| `pnpm dev`         | Start development server with hot reloading    |
| `pnpm build`       | Build the application for production           |
| `pnpm preview`     | Preview the production build locally           |
| `pnpm test`        | Run the test suite with Vitest                 |
| `pnpm check`       | Run SvelteKit sync and svelte-check validation |
| `pnpm format`      | Check code formatting with Prettier            |
| `pnpm lint`        | Lint code with ESLint                          |
| `pnpm db:generate` | Generate Prisma client from schema             |
| `pnpm db:migrate`  | Create and apply new database migrations       |
| `pnpm db:deploy`   | Apply pending database migrations (production) |
| `pnpm db:reset`    | Reset database and reapply all migrations      |
| `pnpm db:seed`     | Seed the database with initial data            |

### Development Setup

**Prerequisites:**

- Node.js version 22 or 23
- pnpm package manager
- Docker and Docker Compose (for local services)

**Initial Setup:**

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Start required local services (PostgreSQL, Valkey, MinIO, Weaviate):

   ```sh
   docker compose up -d valkey postgres minio weaviate
   ```

3. Configure MinIO:
   - Access MinIO console at `http://localhost:9001`
   - Create a bucket named `onward`

4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required values (database URLs, API keys, OAuth credentials)

5. Run database migrations:

   ```sh
   pnpm db:migrate
   ```

6. Start the development server:
   ```sh
   pnpm dev
   ```

## Code Style Guidelines

### Formatting

The project uses **Prettier** for consistent code formatting with the following configuration:

- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Quotes**: Single quotes
- **Trailing Commas**: Always
- **Plugins**: prettier-plugin-svelte, prettier-plugin-tailwindcss

### Linting

The project uses **ESLint** with TypeScript and Svelte plugins. Key rules include:

- **Import Sorting**: Imports must be sorted using `eslint-plugin-simple-import-sort`
- **Unused Variables**: Variables and args prefixed with `_` are ignored
- **Type Imports**: Use inline type imports (e.g., `import { type Foo } from '...'`)
- **TypeScript**: Follows recommended and stylistic TypeScript ESLint rules

### Automated Checks

The project uses **Husky** Git hooks to enforce code quality:

- **Pre-commit**: Runs `lint-staged` which automatically formats and lints staged files
- **Pre-push**: Runs TypeScript type checking (`tsc`) and SvelteKit checks (`svelte-check`)

### Manual Quality Checks

Run these commands before committing if needed:

```sh
# Format all code
pnpm format

# Lint all code
pnpm lint

# Run type checking
pnpm -r check
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add user profile page
fix: correct typo in navigation
docs: update README with new setup steps
chore: update dependencies
```

## Testing Instructions

### Test Framework

The project uses **Vitest** with **Testing Library** for Svelte components.

### Running Tests

```sh
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage
```

### Test File Locations

- Test files should be co-located with the source files they test
- Use the naming convention: `*.test.ts` or `*.spec.ts`

### Writing Tests

- Use Testing Library's Svelte utilities for component testing
- Follow the "Arrange-Act-Assert" pattern
- Write descriptive test names that explain the expected behavior
- Mock external dependencies (database, API calls) appropriately

### Test Configuration

- **Config File**: `vitest.config.ts`
- **Setup File**: `vitest.setup.ts`
- **Environment**: jsdom for DOM testing

## Security Considerations

### Environment Variables

**CRITICAL**: Never commit sensitive credentials to version control.

- Use `.env` for local development (git-ignored)
- Reference `.env.example` for required environment variables
- Production credentials should be managed through secure secrets management
- Required sensitive variables include:
  - Database connection strings (`POSTGRES_URL`, `VALKEY_URL`)
  - API keys (`OPENAI_API_KEY`, `WEAVIATE_API_KEY`)
  - OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
  - S3 storage credentials (`S3_ACCESS_KEY`, `S3_SECRET_KEY`)

### Authentication

- The application uses **Google OAuth2** for authentication
- Configure `GOOGLE_HOSTED_DOMAIN` to restrict access to specific domains if needed
- OAuth tokens and sessions should be handled securely

### Data Storage

- **Database**: PostgreSQL with Prisma ORM for type-safe queries
- **Caching**: Valkey for session and cache storage
- **File Storage**: S3-compatible storage for user uploads
- **Vector Data**: Weaviate for embeddings and semantic search

### Dependencies

- Keep dependencies up to date to patch security vulnerabilities
- Use `pnpm audit` to check for known vulnerabilities
- Review package patches in the `patches/` directory

### Input Validation

- All user inputs should be validated and sanitized
- Use Prisma's parameterized queries to prevent SQL injection
- Implement proper CORS policies
- Use Content Security Policy (CSP) headers

### Docker Security

- Local development uses Docker Compose for services
- Ensure Docker images are from trusted sources
- Keep Docker and Docker Compose updated
- Use strong credentials even in local development to maintain good practices

### Best Practices

- Follow principle of least privilege for database access
- Implement rate limiting for API endpoints
- Use HTTPS in production environments
- Regularly rotate API keys and credentials
- Sanitize data before rendering (prevent XSS attacks)
- Implement proper error handling without leaking sensitive information
- Use DOMPurify for sanitizing HTML content (already included as dependency)

---

**Note for AI Agents**: When making changes to this project, always ensure code quality checks pass, tests are updated accordingly, and security best practices are followed. Refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.
