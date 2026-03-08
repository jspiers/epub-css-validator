# EPUB CSS Validator

A command-line tool to validate CSS in EPUB files using Calibre's stylelint rules. This tool helps ensure your EPUB CSS follows the same standards as Calibre's Edit Book tool.

## License

This program is licensed under the **GNU General Public License v3 (GPLv3)**.

This program uses CSS validation rules from [Calibre](https://calibre-ebook.com/), which is also licensed under the GNU General Public License v3.

**Calibre Copyright (C) 2023 Kovid Goyal <kovid at kovidgoyal.net>**

See the [LICENSE](LICENSE) file for the full text of the GNU General Public License.

## Features

- ✅ Uses Calibre's official stylelint configuration
- ✅ Validates individual CSS files, directories, or EPUB files
- ✅ Multiple output formats (text, JSON, JUnit XML)
- ✅ Auto-updates Calibre's rules from GitHub
- ✅ Custom configuration support
- ✅ Easy integration with CI/CD pipelines

## Installation

### Prerequisites

- Node.js 18.0.0 or higher

### Install Dependencies

```bash
cd epub-css-validator
npm install
```

### Make Executable (Linux/macOS)

```bash
chmod +x bin/epub-css-validator.js
```

### Install Globally (Optional)

```bash
npm link
```

Now you can run `epub-css-validator` from anywhere.

## Usage

### Basic Usage

```bash
# Validate a CSS file
node bin/epub-css-validator.js stylesheet.css

# Validate all CSS files in a directory
node bin/epub-css-validator.js ./styles/

# Validate an EPUB file
node bin/epub-css-validator.js book.epub

# Validate multiple files
node bin/epub-css-validator.js file1.css file2.css book.epub
```

### Options

```
Usage: epub-css-validator [options] [files...]

Validate CSS in EPUB files using Calibre's stylelint rules

Arguments:
  files                    CSS files, directories, or EPUB files to validate

Options:
  -f, --format <format>    Output format: text, json, junit (default: "text")
  -u, --update-config      Update Calibre's stylelint config from GitHub
  -c, --config <path>      Use custom stylelint config file
  -v, --verbose            Verbose output
  --cache-info             Show cached Calibre config information
  -h, --help               Display help for command
  -V, --version            Display version number
```

### Examples

#### Update Calibre's Rules

```bash
node bin/epub-css-validator.js --update-config
```

This fetches the latest stylelint configuration from Calibre's GitHub repository and caches it locally.

#### Check Cached Config Info

```bash
node bin/epub-css-validator.js --cache-info
```

Output:
```
Cached Calibre Config:
  Version: f5255d5
  Cached: 2024-03-08T12:00:00.000Z
  Path: /path/to/.cache/calibre-stylelint.js
```

#### JSON Output (for CI/CD)

```bash
node bin/epub-css-validator.js --format json book.epub
```

#### JUnit XML Output (for test runners)

```bash
node bin/epub-css-validator.js --format junit book.epub
```

#### Use Custom Configuration

```bash
node bin/epub-css-validator.js --config ./my-stylelint.js stylesheet.css
```

#### Verbose Mode

```bash
node bin/epub-css-validator.js --verbose book.epub
```

## Output

### Text Format (Default)

```
Validating EPUB: book.epub
  Checking: OEBPS/stylesheet.css

OEBPS/stylesheet.css
  31:5  ✖  Unexpected unknown property "adobe-hyphenate"  property-no-unknown
  47:4  ✖  Unexpected empty block                        block-no-empty

✗ 2 error(s)
```

### JSON Format

```json
{
  "results": [
    {
      "source": "OEBPS/stylesheet.css",
      "errored": true,
      "warnings": [
        {
          "line": 31,
          "column": 5,
          "rule": "property-no-unknown",
          "severity": "error",
          "text": "Unexpected unknown property \"adobe-hyphenate\""
        }
      ]
    }
  ]
}
```

## Calibre's CSS Validation Rules

This tool uses the same stylelint configuration as Calibre's Edit Book tool. The rules include:

- `property-no-unknown` - Flags unknown CSS properties
- `block-no-empty` - Flags empty CSS blocks
- `selector-type-no-unknown` - Flags unknown HTML element selectors
- `color-no-invalid-hex` - Flags invalid hex colors
- `declaration-block-no-duplicate-properties` - Flags duplicate properties
- `function-no-unknown` - Flags unknown CSS functions
- `unit-no-unknown` - Flags unknown CSS units
- And many more...

For the complete list, see Calibre's [stylelint.js](https://github.com/kovidgoyal/calibre/blob/master/resources/stylelint.js) configuration file.

## How It Works

1. **Config Fetching**: The tool fetches Calibre's `stylelint.js` configuration from GitHub and caches it locally.

2. **Rule Extraction**: It extracts the rules from Calibre's JavaScript configuration format.

3. **Validation**: It uses stylelint to validate CSS files against these rules.

4. **EPUB Support**: For EPUB files, it extracts CSS files, validates them, and reports results.

## Updating Rules

Calibre may update their CSS validation rules over time. To get the latest rules:

```bash
node bin/epub-css-validator.js --update-config
```

The tool will:
- Fetch the latest config from Calibre's GitHub repository
- Cache it locally in `.cache/calibre-stylelint.js`
- Store version information in `.cache/cache-info.json`

## CI/CD Integration

### GitHub Actions Example

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
          node-version: '18'
      - name: Install dependencies
        run: |
          cd epub-css-validator
          npm install
      - name: Update Calibre config
        run: node bin/epub-css-validator.js --update-config
      - name: Validate EPUB
        run: node bin/epub-css-validator.js --format json book.epub
```

### GitLab CI Example

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

### "No cached config found"

Run `--update-config` to fetch Calibre's configuration:

```bash
node bin/epub-css-validator.js --update-config
```

### "Could not parse Calibre config"

This usually means Calibre's config format has changed. Try updating the config again:

```bash
node bin/epub-css-validator.js --update-config
```

If the problem persists, you can use a custom config file instead:

```bash
node bin/epub-css-validator.js --config ./my-stylelint.js stylesheet.css
```

### Network Issues

If you can't fetch Calibre's config from GitHub, you can manually download it:

1. Download `stylelint.js` from https://github.com/kovidgoyal/calibre/blob/master/resources/stylelint.js
2. Save it to `.cache/calibre-stylelint.js`
3. Create `.cache/cache-info.json` with version info

## Development

### Project Structure

```
epub-css-validator/
├── bin/
│   └── epub-css-validator.js    # CLI entry point
├── lib/
│   └── validator.js             # Main validation logic
├── config/
│   └── stylelintrc.js           # Local config (optional)
├── .cache/                      # Cached Calibre config (auto-created)
├── package.json
└── README.md
```

### Running Tests

```bash
npm test
```

### Updating Dependencies

```bash
npm update
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [Calibre](https://calibre-ebook.com/) - For the excellent CSS validation rules
  - Calibre is developed by Kovid Goyal and contributors
  - Calibre is licensed under the GNU General Public License v3
  - This tool fetches and uses Calibre's stylelint configuration from https://github.com/kovidgoyal/calibre
- [stylelint](https://stylelint.io/) - The CSS linter that powers this tool
