# Testing

## Summary

Comprehensive test suite for the EPUB CSS Validator using Vitest.

## Test Results

- ✅ **32 tests passing**
- ✅ **~62% code coverage**
- ✅ **4 test files** (unit + integration + edge cases)

## Test Structure

```
tests/
├── unit/
│   └── validator.test.js          # 7 tests for core functions
├── integration/
│   ├── css-validation.test.js     # 9 tests for CSS validation
│   ├── epub-validation.test.js    # 6 tests for EPUB validation
│   └── edge-cases.test.js         # 10 tests for edge cases
└── fixtures/
    └── epub/
        └── pride-prejudice.epub  # Public domain test EPUB
```

## Test Coverage

### Unit Tests (7 tests)
- ✅ Extract rules from Calibre config format
- ✅ Handle nested rule configurations
- ✅ Return empty object if rules not found
- ✅ Handle complex nested structures
- ✅ Return default stylelint rules
- ✅ Have correct rule values

### Integration Tests (25 tests)

#### CSS Validation (9 tests)
- ✅ Detect errors in test.css
- ✅ Detect empty blocks
- ✅ Detect unknown properties
- ✅ Detect unknown type selectors
- ✅ Return correct error counts
- ✅ Handle JSON output format
- ✅ Handle JUnit output format
- ✅ Validate valid CSS without errors
- ✅ Handle non-existent file gracefully

#### EPUB Validation (6 tests)
- ✅ Validate public domain EPUB file
- ✅ Detect CSS errors in public domain EPUB
- ✅ Handle EPUB with no CSS files
- ✅ Handle non-existent EPUB file
- ✅ Handle JSON output format for EPUB
- ✅ Handle JUnit output format for EPUB

#### Edge Cases (10 tests)
- ✅ Handle EPUB with missing required files
- ✅ Handle EPUB with invalid XML structure
- ✅ Handle corrupted ZIP archive
- ✅ Handle EPUB with no CSS files
- ✅ Handle EPUB with only metadata files
- ✅ Handle CSS with syntax errors
- ✅ Handle CSS with encoding issues
- ✅ Handle CSS with circular dependencies
- ✅ Handle EPUB with very large CSS files
- ✅ Handle concurrent validation efficiently

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Coverage Report

Current coverage: **~62%**

Uncovered areas:
- `validateDirectory` function (not currently used)
- Some edge cases in error handling
- JUnit formatting edge cases

## Test Fixture

The EPUB test fixture is **Pride and Prejudice** from Project Gutenberg (public domain):
- Source: https://www.gutenberg.org/ebooks/1342.epub.noimages
- License: Public domain
- Attribution: Jane Austen

## Notes

- Tests use JSON output format for easier assertions
- Console output is mocked during tests
- Temporary files are cleaned up after tests
- Tests are fast (~6 seconds for full suite)
- TypeScript source files are imported directly (`.ts` extension)
