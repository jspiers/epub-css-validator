# AI Agent Guidelines for EPUB CSS Validator

This document provides hints and guidelines for AI coding agents working on this project.

## Project Overview

EPUB CSS Validator is a Node.js command-line tool that validates CSS in EPUB files using Calibre's stylelint rules. It fetches Calibre's configuration from GitHub and uses it to validate CSS files. The project is written in TypeScript with full type definitions for library use.

## Key Technical Details

### License Compliance
- **CRITICAL**: This project is licensed under **GPLv3** due to using Calibre's stylelint rules
- **Copyright**: "Copyright (C) 2026 Jeff Spiers" - update to include contributors when they join
- **Source files**: All .ts and .js files must include copyright header with GPL boilerplate
- **Calibre attribution**: Must preserve "Calibre Copyright (C) 2023 Kovid Goyal <kovid at kovidgoyal.net>" in all files
- **LICENSE file**: Contains full GPLv3 text plus project copyright notice
- **New files**: Add this header to all new source files:
  ```typescript
  /**
   * [Brief description]
   *
   * Copyright (C) 2026 Jeff Spiers
   *
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   *
   * This program uses CSS validation rules from Calibre (https://calibre-ebook.com/),
   * which is licensed under the GNU General Public License v3.
   * Calibre Copyright (C) 2023 Kovid Goyal <kovid at kovidgoyal.net>
   *
   * See LICENSE file for the full text of the GNU General Public License.
   */
  ```

### Architecture
- **Entry Point**: `bin/epub-css-validator.ts` - CLI interface using Commander.js
- **Core Logic**: `lib/core.ts` - Pure validation logic (library-ready, no console output)
- **Dependencies**: stylelint 16.x, axios, jszip, chalk 5.x, commander 11.x
- **Module System**: ESM (ECMAScript Modules) - `"type": "module"` in package.json
- **Language**: TypeScript with full type definitions

### Important Version Constraints
- **chalk**: Must use version 5.x (ESM-only)
- **stylelint**: Must use version 16.x (ESM-only)
- **Node.js**: Requires 18.0.0 or higher
- **TypeScript**: 5.9.3

### Calibre Config Parsing
- Calibre's `stylelint.js` is wrapped in a browser-style IIFE for WebEngine
- The `extractRules()` function uses bracket-matching to extract the rules object
- Config is cached locally in `.cache/calibre-stylelint.js`
- Config metadata stored in `.cache/cache-info.json`

### Testing
- **Framework**: Vitest
- **Coverage**: ~62% (32 tests passing)
- **Test Files**: `tests/unit/validator.test.js`, `tests/integration/css-validation.test.js`, `tests/integration/epub-validation.test.js`, `tests/integration/edge-cases.test.js`
- **Test Fixture**: Public domain EPUB from Project Gutenberg (Pride and Prejudice)

## Common Tasks

### Adding New Validation Rules
1. Update Calibre config: `npm run update-config`
2. Rules are automatically fetched from Calibre's GitHub
3. No manual rule updates needed - they come from Calibre

### Modifying Output Formats
- Text format: Handled in `displayErrors()` function in CLI
- JSON format: Uses stylelint's built-in JSON formatter
- JUnit format: Handled by `formatJUnit()` function in core.ts

### Testing Changes
```bash
# Run all tests
npm test

# Test with example file
npx tsx bin/epub-css-validator.ts examples/test.css

# Test with EPUB
npx tsx bin/epub-css-validator.ts path/to/book.epub

# Test different formats
npx tsx bin/epub-css-validator.ts --format json examples/test.css
npx tsx bin/epub-css-validator.ts --format junit examples/test.css
```

### Type Checking
```bash
# Type check without compilation
npm run type-check

# Compile TypeScript
npm run build
```

## Code Style Guidelines

### Error Handling
- Always use try-catch for async operations
- Provide helpful error messages
- Use chalk for colored console output
- Exit with appropriate exit codes (0 for success, 1 for errors)

### File Operations
- Use `fs/promises` for async file operations
- Clean up temporary files (use try-finally)
- Handle file not found errors gracefully

### Config Management
- Always check for cached config before fetching
- Update cache info when fetching new config
- Handle network errors when fetching from GitHub

### Library-Friendly Design
- Core functions in `lib/core.ts` have no console output
- CLI in `bin/epub-css-validator.ts` handles all user-facing output
- Functions return structured data for programmatic use
- Full TypeScript type definitions for all public APIs

### TypeScript Best Practices
- Use proper type annotations for all exported functions
- Define interfaces for complex return types
- Use `as` type assertions only when necessary
- Leverage TypeScript's type inference where appropriate

## Common Pitfalls

### Don't Use CommonJS
```typescript
// ❌ WRONG - project is ESM
const chalk = require('chalk');

// ✅ CORRECT - ESM imports
import chalk from 'chalk';
```

### Don't Use Deprecated stylelint Options
```typescript
// ❌ WRONG - deprecated
await stylelint.lint({ files: filePath, formatter: 'json' });

// ✅ CORRECT - use report option
await stylelint.lint({ files: filePath, report: 'json' });
```

### Don't Break Calibre Config Parsing
The `extractRules()` function is fragile - it parses Calibre's IIFE-wrapped config. When modifying:
- Test with `--update-config` to ensure parsing works
- Check that rules are extracted correctly
- Verify the tool still validates CSS properly

### Don't Access Deprecated Properties
```typescript
// ❌ WRONG - accessing deprecated 'output' property
JSON.stringify(result, null, 2)

// ✅ CORRECT - access 'results' directly
JSON.stringify({ results: result.results }, null, 2)
```

### Don't Ignore TypeScript Errors
- Always run `npm run type-check` before committing
- Fix type errors rather than using `@ts-ignore` or `any`
- Use proper type definitions for external libraries

## Project Structure

```
epub-css-validator/
├── bin/
│   └── epub-css-validator.ts    # CLI entry point
├── lib/
│   └── core.ts                  # Core validation logic (library-ready)
├── config/
│   └── stylelintrc.js           # Example custom config
├── examples/
│   └── test.css                 # Test file with errors
├── tests/
│   ├── unit/
│   │   └── validator.test.js    # Unit tests
│   ├── integration/
│   │   ├── css-validation.test.js    # CSS validation tests
│   │   ├── epub-validation.test.js   # EPUB validation tests
│   │   └── edge-cases.test.js        # Edge case tests
│   └── fixtures/
│       └── epub/
│           └── pride-prejudice.epub  # Public domain test EPUB
├── .cache/                      # Cached Calibre config (auto-created)
├── tsconfig.json                # TypeScript configuration
├── vitest.config.js             # Vitest configuration
├── package.json
├── LICENSE                      # GPLv3 license
├── README.md
└── AGENTS.md                    # This file
```

## Debugging Tips

### Enable Debug Mode
```bash
DEBUG=1 npx tsx bin/epub-css-validator.ts examples/test.css
```

### Check Cached Config
```bash
npx tsx bin/epub-css-validator.ts --cache-info
```

### View Cached Config
```bash
cat .cache/calibre-stylelint.js
```

### Force Config Update
```bash
npm run update-config
```

### Trace Deprecation Warnings
```bash
NODE_OPTIONS="--trace-deprecation" npm test
```

## External Dependencies

### Calibre
- Repository: https://github.com/kovidgoyal/calibre
- Config file: `resources/stylelint.js`
- License: GPLv3
- Author: Kovid Goyal

### stylelint
- Website: https://stylelint.io/
- Version: 16.0.0
- Documentation: https://stylelint.io/user-guide/rules/

## Contributing Guidelines

1. **Preserve GPLv3 License** - All code must be GPLv3 compatible
2. **Test thoroughly** - Test with both CSS files and EPUB files
3. **Update documentation** - Keep README.md and this file in sync
4. **Follow existing patterns** - Match the code style and structure
5. **Handle errors gracefully** - Provide helpful error messages
6. **Maintain compatibility** - Don't break existing functionality
7. **Keep core library-friendly** - No console output in lib/core.ts
8. **Maintain type safety** - Run `npm run type-check` before committing

## Performance Considerations

- Config is cached locally to avoid repeated GitHub API calls
- EPUB files are extracted and validated in memory
- Temporary CSS files are cleaned up after validation
- Use async/await for all I/O operations

## Security Considerations

- Config is fetched from GitHub over HTTPS
- Temporary files are created in `.cache` directory
- No user input is executed as code (except trusted Calibre config)
- File paths are validated before processing
