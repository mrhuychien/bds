# CLAUDE.md - AI Assistant Guidelines

> This file provides context and guidelines for AI assistants working with this codebase.

## Project Overview

**Repository:** bds
**Status:** New project (initial setup)

This is a newly initialized repository. As the project develops, this document should be updated to reflect the actual codebase structure, conventions, and workflows.

---

## Quick Reference

### Essential Commands

```bash
# Development (update these as project develops)
# npm install          # Install dependencies
# npm run dev          # Start development server
# npm run build        # Build for production
# npm run test         # Run tests
# npm run lint         # Run linter
```

### Branch Naming Convention

- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Claude branches: `claude/<description>-<session-id>`

---

## Project Structure

```
bds/
├── CLAUDE.md           # This file - AI assistant guidelines
├── README.md           # Project documentation (to be added)
├── src/                # Source code (to be added)
│   ├── components/     # UI components
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── types/          # Type definitions
├── tests/              # Test files
├── docs/               # Documentation
└── config/             # Configuration files
```

*Note: Update this structure as the project develops.*

---

## Development Guidelines

### Code Style & Conventions

1. **Naming Conventions**
   - Use camelCase for variables and functions
   - Use PascalCase for classes and components
   - Use SCREAMING_SNAKE_CASE for constants
   - Use kebab-case for file names

2. **File Organization**
   - Keep files focused and single-purpose
   - Group related functionality together
   - Separate concerns (UI, logic, data)

3. **Documentation**
   - Add JSDoc comments for public APIs
   - Document complex logic inline
   - Keep README.md updated

### Git Workflow

1. **Commits**
   - Write clear, descriptive commit messages
   - Use conventional commit format: `type(scope): description`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

2. **Pull Requests**
   - Include clear description of changes
   - Reference related issues
   - Ensure tests pass before merging

3. **Branches**
   - Keep branches focused and short-lived
   - Merge frequently to avoid conflicts
   - Delete branches after merging

---

## For AI Assistants

### Before Making Changes

1. **Understand the context**
   - Read relevant files before modifying
   - Check existing patterns and conventions
   - Review recent commits for context

2. **Plan carefully**
   - Use TodoWrite to track multi-step tasks
   - Break complex tasks into smaller steps
   - Consider edge cases and error handling

### When Writing Code

1. **Follow existing patterns**
   - Match the code style of surrounding code
   - Use established project conventions
   - Maintain consistency throughout

2. **Keep changes minimal**
   - Only modify what's necessary
   - Avoid over-engineering
   - Don't add features beyond what's requested

3. **Ensure quality**
   - Run tests after changes
   - Check for security vulnerabilities
   - Validate input at system boundaries

### When Committing

1. **Write good commit messages**
   - Summarize what changed and why
   - Use conventional commit format
   - Reference issues when applicable

2. **Verify before pushing**
   - Run all tests
   - Check for linting errors
   - Review changed files

---

## Testing

### Running Tests

```bash
# Run all tests (update command as needed)
# npm test

# Run specific tests
# npm test -- --grep "pattern"

# Run with coverage
# npm test -- --coverage
```

### Writing Tests

- Place tests adjacent to source files or in `tests/` directory
- Use descriptive test names
- Cover edge cases and error conditions
- Mock external dependencies

---

## Configuration

### Environment Variables

Create a `.env` file for local development (do not commit):

```bash
# Example environment variables (update as needed)
# NODE_ENV=development
# API_URL=http://localhost:3000
# DEBUG=true
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `.eslintrc` | Linting rules |
| `.prettierrc` | Code formatting |
| `.env` | Environment variables (local) |

---

## Troubleshooting

### Common Issues

1. **Dependencies not installing**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify npm registry access

2. **Tests failing**
   - Check for environment variable issues
   - Verify mock configurations
   - Review recent changes

3. **Build errors**
   - Check TypeScript errors
   - Verify import paths
   - Check for missing dependencies

---

## Resources

- [Project Documentation](./docs/) (to be added)
- [Contributing Guide](./CONTRIBUTING.md) (to be added)
- [API Reference](./docs/api/) (to be added)

---

## Maintenance

**Last Updated:** 2026-01-14
**Updated By:** AI Assistant (Claude)

> Update this document when:
> - Project structure changes
> - New conventions are established
> - Important patterns are added
> - Development workflows change
