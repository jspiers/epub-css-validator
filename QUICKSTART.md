# Quick Start Guide

Get started with EPUB CSS Validator in 3 simple steps.

## Step 1: Install Dependencies

```bash
cd epub-css-validator
npm install
```

## Step 2: Update Calibre's Rules

```bash
node bin/epub-css-validator.js --update-config
```

This fetches the latest CSS validation rules from Calibre's GitHub repository.

## Step 3: Validate Your Files

```bash
# Validate a CSS file
node bin/epub-css-validator.js examples/test.css

# Validate an EPUB file
node bin/epub-css-validator.js ../Kawaii-fixed.epub
```

## Example Output

```
Validating CSS: examples/test.css

examples/test.css
  10:1  ✖  Unexpected empty block                        block-no-empty
  15:5  ✖  Unexpected unknown property "adobe-hyphenate"  property-no-unknown
  21:1  ✖  Unexpected unknown type selector "toc1"        selector-type-no-unknown

✗ 3 error(s)
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Try different output formats: `--format json` or `--format junit`
- Use custom configuration: `--config config/stylelintrc.js`
- Integrate with CI/CD pipelines

## Troubleshooting

### "command not found: node"

Install Node.js from https://nodejs.org/ (version 18.0.0 or higher required).

### "Cannot find module"

Make sure you ran `npm install` in the epub-css-validator directory.

### Network errors when updating config

If you can't access GitHub, you can manually download Calibre's config:
1. Visit https://github.com/kovidgoyal/calibre/blob/master/resources/stylelint.js
2. Save the content to `.cache/calibre-stylelint.js`
3. Create `.cache/cache-info.json` with: `{"version":"manual","cachedAt":"2024-01-01T00:00:00.000Z","path":".cache/calibre-stylelint.js"}`
