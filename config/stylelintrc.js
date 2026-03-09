/**
 * EPUB CSS Validator - Example Custom Configuration
 *
 * Copyright (C) 2026 Jeff Spiers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
