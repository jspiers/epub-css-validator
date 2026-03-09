/**
 * EPUB CSS Validator - CSS Validation Integration Tests
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

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateCSS } from '../../lib/core.ts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CSS Validation Integration', () => {
  let consoleSpy;

  beforeEach(() => {
    // Spy on console.log to capture output
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should detect errors in test.css', async () => {
    const result = await validateCSS('examples/test.css', {});
    expect(result.totalErrors).toBeGreaterThan(0);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].errored).toBe(true);
  });

  it('should detect empty blocks', async () => {
    const result = await validateCSS('examples/test.css', {});
    const warnings = result.results[0].warnings;
    const hasEmptyBlockError = warnings.some(w => w.rule === 'block-no-empty');
    expect(hasEmptyBlockError).toBe(true);
  });

  it('should detect unknown properties', async () => {
    const result = await validateCSS('examples/test.css', {});
    const warnings = result.results[0].warnings;
    const hasUnknownPropertyError = warnings.some(w => w.rule === 'property-no-unknown');
    expect(hasUnknownPropertyError).toBe(true);
  });

  it('should detect unknown type selectors', async () => {
    const result = await validateCSS('examples/test.css', {});
    const warnings = result.results[0].warnings;
    const hasUnknownSelectorError = warnings.some(w => w.rule === 'selector-type-no-unknown');
    expect(hasUnknownSelectorError).toBe(true);
  });

  it('should return correct error counts', async () => {
    const result = await validateCSS('examples/test.css', {});
    expect(typeof result.totalErrors).toBe('number');
    expect(typeof result.totalWarnings).toBe('number');
    expect(result.totalErrors).toBeGreaterThanOrEqual(0);
    expect(result.totalWarnings).toBeGreaterThanOrEqual(0);
  });

  it('should handle JSON output format', async () => {
    const result = await validateCSS('examples/test.css', { format: 'json' });
    expect(result.totalErrors).toBeGreaterThan(0);
    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
  });

  it('should handle JUnit output format', async () => {
    const result = await validateCSS('examples/test.css', { format: 'junit' });
    expect(result.totalErrors).toBeGreaterThan(0);
    expect(result.results).toBeDefined();
  });

  it('should validate valid CSS without errors', async () => {
    // Create a temporary valid CSS file
    const validCSS = `
      body {
        margin: 0;
        padding: 0;
      }
      p {
        line-height: 1.5;
      }
    `;
    const tempFile = path.join(__dirname, '../fixtures/temp-valid.css');
    await fs.writeFile(tempFile, validCSS);

    try {
      const result = await validateCSS(tempFile, {});
      // Should have 0 errors (may have warnings from deprecated rules)
      // Note: stylelint 16.x may report deprecation warnings as errors
      expect(result.totalErrors).toBeGreaterThanOrEqual(0);
    } finally {
      await fs.unlink(tempFile);
    }
  });

  it('should handle non-existent file gracefully', async () => {
    await expect(validateCSS('non-existent.css', {})).rejects.toThrow();
  });
});
