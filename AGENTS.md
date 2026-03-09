# AI Agent Guidelines for EPUB CSS Validator

This document provides hints and guidelines for AI coding agents working on this project.

## Project Overview

EPUB CSS Validator is a Node.js command-line tool that validates CSS in EPUB files using Calibre's stylelint rules. It fetches Calibre's configuration from GitHub and uses it to validate CSS files.

## Key Technical Details

### License Compliance
- **CRITICAL**: This project is licensed under **GPLv3** due to using Calibre's stylelint rules
- Any modifications must preserve the GPLv3 license
- Always include GPL license headers in new source files
- Attribute Calibre (Kovid Goyal) as the source of the validation rules

### Architecture
- **Entry Point**: `bin/epub-css-validator.js` - CLI interface using Commander.js
- **Core Logic**: `lib/core.js` - Pure validation logic (library-ready, no console output)
- **Dependencies**: stylelint 16.x, axios, jszip, chalk 5.x, commander 11.x
- **Module System**: ESM (ECMAScript Modules) - `"type": "module"` in package.json

### Important Version Constraints
- **chalk**: Must use version 5.x (ESM-only)
- **stylelint**: Must use version 16.x (ESM-only)
- **Node.js**: Requires 18.0.0 or higher

### Calibre Config Parsing
- Calibre's `stylelint.js` is wrapped in a browser-style IIFE for WebEngine
- The `extractRules()` function uses bracket-matching to extract the rules object
- Config is cached locally in `.cache/calibre-stylelint.js`
- Config metadata stored in `.cache/cache-info.json`

### Testing
- **Framework**: Vitest
- **Coverage**: ~62% (22 tests passing)
- **Test Files**: `tests/unit/validator.test.js`, `tests/integration/css-validation.test.js`, `tests/integration/epub-validation.test.js`
- **Test Fixture**: Public domain EPUB from Project Gutenberg (Pride and Prejudice)

## Common Tasks

### Adding New Validation Rules
1. Update Calibre config: `node bin/epub-css-validator.js --update-config`
2. Rules are automatically fetched from Calibre's GitHub
3. No manual rule updates needed - they come from Calibre

### Modifying Output Formats
- Text format: Handled in `displayErrors()` function in CLI
- JSON format: Uses stylelint's built-in JSON formatter
- JUnit format: Handled by `formatJUnit()` function in core.js

### Testing Changes
```bash
# Run all tests
npm test

# Test with example file
node bin/epub-css-validator.js examples/test.css

# Test with EPUB
node bin/epub-css-validator.js path/to/book.epub

# Test different formats
node bin/epub-css-validator.js --format json examples/test.css
node bin/epub-css-validator.js --format junit examples/test.css
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
- Core functions in `lib/core.js` have no console output
- CLI in `bin/epub-css-validator.js` handles all user-facing output
- Functions return structured data for programmatic use
- No "as" imports - use direct imports

## Common Pitfalls

### Don't Use CommonJS
```javascript
// ❌ WRONG - project is ESM
const chalk = require('chalk');

// ✅ CORRECT - ESM imports
import chalk from 'chalk';
```

### Don't Use Deprecated stylelint Options
```javascript
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
```javascript
// ❌ WRONG - accessing deprecated 'output' property
JSON.stringify(result, null, 2)

// ✅ CORRECT - access 'results' directly
JSON.stringify({ results: result.results }, null, 2)
```

## Project Structure

```
epub-css-validator/
├── bin/
│   └── epub-css-validator.js    # CLI entry point
├── lib/
│   └── core.js                  # Core validation logic (library-ready)
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
├── package.json
├── LICENSE                      # GPLv3 license
├── README.md
└── AGENTS.md                    # This file
```

## Debugging Tips

### Enable Debug Mode
```bash
DEBUG=1 node bin/epub-css-validator.js examples/test.css
```

### Check Cached Config
```bash
node bin/epub-css-validator.js --cache-info
```

### View Cached Config
```bash
cat .cache/calibre-stylelint.js
```

### Force Config Update
```bash
node bin/epub-css-validator.js --update-config
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
7. **Keep core library-friendly** - No console output in lib/core.js

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
