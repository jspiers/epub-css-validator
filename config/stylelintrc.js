/**
 * Example custom stylelint configuration
 *
 * This file demonstrates how to create a custom configuration
 * that extends or modifies Calibre's default rules.
 *
 * Usage:
 *   epub-css-validator --config config/stylelintrc.js stylesheet.css
 */

module.exports = {
  rules: {
    // Use Calibre's default rules
    'property-no-unknown': true,
    'block-no-empty': true,
    'selector-type-no-unknown': [true, { ignore: ['custom-elements'] }],
    'color-no-invalid-hex': true,
    'declaration-block-no-duplicate-properties': true,
    'function-no-unknown': true,
    'unit-no-unknown': true,

    // Add custom rules or override defaults
    // Example: Allow vendor prefixes
    // 'property-no-unknown': [true, { ignorePrefixed: true }],

    // Example: Disable specific rules
    // 'block-no-empty': null,

    // Example: Add rule severity
    // 'color-no-invalid-hex': 'warning',
  },
};
