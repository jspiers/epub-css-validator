/**
 * EPUB CSS Validator - Unit Tests
 *
 * Copyright (C) 2026 Jeff Spiers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE file for the full text of the GNU General Public License.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractRules, getDefaultRules } from '../../lib/core.ts';

describe('extractRules', () => {
  it('should extract rules from Calibre config format', () => {
    const config = `
      rules: {
        'property-no-unknown': true,
        'block-no-empty': true,
        'selector-type-no-unknown': [true, { ignore: ['custom-elements'] }]
      }
    `;
    const rules = extractRules(config);
    expect(rules['property-no-unknown']).toBe(true);
    expect(rules['block-no-empty']).toBe(true);
    expect(rules['selector-type-no-unknown']).toEqual([true, { ignore: ['custom-elements'] }]);
  });

  it('should handle nested rule configurations', () => {
    const config = `
      rules: {
        'declaration-block-no-duplicate-properties': [
          true,
          {
            ignore: ['consecutive-duplicates-with-different-values']
          }
        ]
      }
    `;
    const rules = extractRules(config);
    expect(rules['declaration-block-no-duplicate-properties']).toEqual([
      true,
      { ignore: ['consecutive-duplicates-with-different-values'] }
    ]);
  });

  it('should return empty object if rules not found', () => {
    const rules = extractRules('invalid config');
    expect(rules).toEqual({});
  });

  it('should return empty object if no rules found', () => {
    const config = 'no rules here';
    const rules = extractRules(config);
    expect(rules).toEqual({});
  });

  it('should handle complex nested structures', () => {
    const config = `
      rules: {
        'property-no-unknown': true,
        'block-no-empty': true,
        'selector-type-no-unknown': [
          true,
          {
            ignore: ['custom-elements'],
            ignoreTypes: ['/^my-/']
          }
        ]
      }
    `;
    const rules = extractRules(config);
    expect(rules['selector-type-no-unknown']).toEqual([
      true,
      {
        ignore: ['custom-elements'],
        ignoreTypes: ['/^my-/']
      }
    ]);
  });
});

describe('getDefaultRules', () => {
  it('should return default stylelint rules', () => {
    const rules = getDefaultRules();
    expect(rules).toHaveProperty('property-no-unknown');
    expect(rules).toHaveProperty('block-no-empty');
    expect(rules).toHaveProperty('selector-type-no-unknown');
    expect(rules).toHaveProperty('color-no-invalid-hex');
    expect(rules).toHaveProperty('declaration-block-no-duplicate-properties');
    expect(rules).toHaveProperty('function-no-unknown');
    expect(rules).toHaveProperty('unit-no-unknown');
  });

  it('should have correct rule values', () => {
    const rules = getDefaultRules();
    expect(rules['property-no-unknown']).toBe(true);
    expect(rules['block-no-empty']).toBe(true);
    expect(rules['selector-type-no-unknown']).toEqual([true, { ignore: ['custom-elements'] }]);
  });
});
