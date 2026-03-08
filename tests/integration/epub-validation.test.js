import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateEPUB } from '../../lib/validator.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('EPUB Validation Integration', () => {
  let consoleSpy;

  beforeEach(() => {
    // Spy on console.log to capture output
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should validate public domain EPUB file', async () => {
    const result = await validateEPUB('tests/fixtures/epub/pride-prejudice.epub', {});
    expect(typeof result.totalErrors).toBe('number');
    expect(typeof result.totalWarnings).toBe('number');
    expect(result.totalErrors).toBeGreaterThanOrEqual(0);
    expect(result.totalWarnings).toBeGreaterThanOrEqual(0);
  });

  it('should detect CSS errors in public domain EPUB', async () => {
    const result = await validateEPUB('tests/fixtures/epub/pride-prejudice.epub', {});
    // Pride and Prejudice has some CSS errors we can test for
    expect(result.totalErrors).toBeGreaterThan(0);
  });

  it('should handle EPUB with no CSS files', async () => {
    // Create a minimal EPUB with no CSS
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    zip.file('mimetype', 'application/epub+zip');
    zip.file('META-INF/container.xml', '<?xml version="1.0"?><container></container>');

    const tempEpub = path.join(__dirname, '../fixtures/temp-no-css.epub');
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.writeFile(tempEpub, buffer);

    try {
      const result = await validateEPUB(tempEpub, {});
      expect(result.totalErrors).toBe(0);
      expect(result.totalWarnings).toBe(0);
    } finally {
      await fs.unlink(tempEpub);
    }
  });

  it('should handle non-existent EPUB file', async () => {
    await expect(validateEPUB('non-existent.epub', {})).rejects.toThrow();
  });

  it('should handle JSON output format for EPUB', async () => {
    const result = await validateEPUB('tests/fixtures/epub/pride-prejudice.epub', { format: 'json' });
    expect(typeof result.totalErrors).toBe('number');
    expect(typeof result.totalWarnings).toBe('number');
  });

  it('should handle JUnit output format for EPUB', async () => {
    const result = await validateEPUB('tests/fixtures/epub/pride-prejudice.epub', { format: 'junit' });
    expect(typeof result.totalErrors).toBe('number');
    expect(typeof result.totalWarnings).toBe('number');
  });
});
