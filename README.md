# EPUB CSS Validator

A command-line tool to validate CSS in EPUB files using the samei
[stylelint](https://stylelint.io/) rules also
[Calibre](https://calibre-ebook.com/)'s Edit Book tool.

## Features

- ✅ Automatically fetches and updates Calibre sylelint rules from GitHub
- ✅ Validates CSS files, directories, or EPUB files
- ✅ Multiple output formats (text, JSON, JUnit XML)
- ✅ Custom configuration support
- ✅ Easy CI/CD integration

## Quick Start

```bash
# Install
cd epub-css-validator
npm install

# Update Calibre's rules
node bin/epub-css-validator.js --update-config

# Validate files
node bin/epub-css-validator.js examples/test.css
node bin/epub-css-validator.js book.epub
```

## Usage

```bash
# Basic validation
node bin/epub-css-validator.js stylesheet.css
node bin/epub-css-validator.js ./styles/
node bin/epub-css-validator.js book.epub

# Options
-f, --format <format>    Output: text, json, junit (default: text)
-u, --update-config      Update Calibre's config from GitHub
-c, --config <path>      Use custom config file
-v, --verbose            Verbose output
--cache-info             Show cached config info
```

### Examples

```bash
# Check cached config
node bin/epub-css-validator.js --cache-info

# JSON output
node bin/epub-css-validator.js --format json book.epub

# JUnit output
node bin/epub-css-validator.js --format junit book.epub

# Custom config
node bin/epub-css-validator.js --config ./my-stylelint.js stylesheet.css
```

## Output

### Text Format (Default)

```
Validating CSS: examples/test.css

examples/test.css
  10:1  ✖  Unexpected empty block                        block-no-empty
  15:5  ✖  Unexpected unknown property "adobe-hyphenate"  property-no-unknown
  21:1  ✖  Unexpected unknown type selector "toc1"        selector-type-no-unknown

✗ 3 error(s)
```

### JSON Format

```json
{
  "results": [
    {
      "source": "examples/test.css",
      "errored": true,
      "warnings": [
        {
          "line": 10,
          "column": 1,
          "rule": "block-no-empty",
          "severity": "error",
          "text": "Unexpected empty block"
        }
      ]
    }
  ]
}
```

## Calibre's Rules

Uses the same stylelint configuration as Calibre's Edit Book tool, including:

- `property-no-unknown` - Unknown CSS properties
- `block-no-empty` - Empty CSS blocks
- `selector-type-no-unknown` - Unknown HTML element selectors
- `color-no-invalid-hex` - Invalid hex colors
- `declaration-block-no-duplicate-properties` - Duplicate properties
- `function-no-unknown` - Unknown CSS functions
- `unit-no-unknown` - Unknown CSS units

See [Calibre's stylelint.js](https://github.com/kovidgoyal/calibre/blob/master/resources/stylelint.js) for the complete list.

## How It Works

1. Fetches Calibre's `stylelint.js` from GitHub and caches it locally
2. Extracts rules from Calibre's JavaScript configuration
3. Validates CSS files using stylelint
4. For EPUB files, extracts and validates all CSS files

## CI/CD Integration

### GitHub Actions

```yaml
name: Validate EPUB CSS
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: |
          cd epub-css-validator
          npm install
          node bin/epub-css-validator.js --update-config
          node bin/epub-css-validator.js --format json book.epub
```

### GitLab CI

```yaml
validate-css:
  image: node:18
  script:
    - cd epub-css-validator
    - npm install
    - node bin/epub-css-validator.js --update-config
    - node bin/epub-css-validator.js --format junit book.epub > report.xml
  artifacts:
    reports:
      junit: report.xml
```

## Troubleshooting

### "command not found: node"

Install Node.js from <https://nodejs.org/> (version 18.0.0+ required).

### "Cannot find module"

Run `npm install` in the epub-css-validator directory.

### "No cached config found"

```bash
node bin/epub-css-validator.js --update-config
```

### "Could not parse Calibre config"

Update the config again. If it persists, use a custom config:

```bash
node bin/epub-css-validator.js --config ./my-stylelint.js stylesheet.css
```

### Network Issues

Manually download Calibre's config:

1. Download from <https://github.com/kovidgoyal/calibre/blob/master/resources/stylelint.js>
2. Save to `.cache/calibre-stylelint.js`
3. Create `.cache/cache-info.json`: `{"version":"manual","cachedAt":"2024-01-01T00:00:00.000Z","path":".cache/calibre-stylelint.js"}`

## Development

```
epub-css-validator/
├── bin/epub-css-validator.js    # CLI entry point
├── lib/validator.js             # Main validation logic
├── config/stylelintrc.js        # Example custom config
├── examples/test.css            # Test file
├── .cache/                      # Cached Calibre config
└── package.json
```

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [Calibre](https://calibre-ebook.com/) - CSS validation rules (GPLv3, Kovid Goyal)
- [stylelint](https://stylelint.io/) - CSS linter

## License

**GNU General Public License version 3 (GPLv3)**

This program uses CSS validation rules from [Calibre](https://calibre-ebook.com/), also licensed under GPLv3.

See [LICENSE](LICENSE) for the full text.
