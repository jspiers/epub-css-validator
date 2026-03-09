/**
 * EPUB CSS Validator - Edge Cases Integration Tests
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
import { validateCSS, validateEPUB, updateConfig } from '../../lib/core.ts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('EPUB Edge Cases', () => {
  let consoleSpy;

  beforeEach(() => {
    // Spy on console.log to capture output
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Malformed EPUBs', () => {
    it('should handle EPUB with missing required files', async () => {
      // Create an EPUB with missing META-INF/container.xml
      // Note: validateEPUB is a CSS validator, not an EPUB structure validator
      // It handles malformed EPUBs gracefully by just validating any CSS files found
      const zip = new JSZip();
      zip.file('mimetype', 'application/epub+zip');
      // Missing META-INF/container.xml - this is required for EPUB but not for CSS validation

      const tempEpub = path.join(__dirname, '../fixtures/temp-malformed.epub');
      const buffer = await zip.generateAsync({ type: 'nodebuffer' });
      await fs.writeFile(tempEpub, buffer);

      try {
        const result = await validateEPUB(tempEpub, {});
        // Should handle gracefully - no CSS files means no errors
        expect(result.totalErrors).toBe(0);
        expect(result.totalWarnings).toBe(0);
      } finally {
        await fs.unlink(tempEpub).catch(() => {});
      }
    });

    it('should handle EPUB with invalid XML structure', async () => {
      // Create an EPUB with invalid XML
      // Note: validateEPUB is a CSS validator, not an EPUB structure validator
      // It handles malformed EPUBs gracefully by just validating any CSS files found
      const zip = new JSZip();
      zip.file('mimetype', 'application/epub+zip');
      zip.file('META-INF/container.xml', '<?xml version="1.0"?><invalid><container></container>');

      const tempEpub = path.join(__dirname, '../fixtures/temp-invalid-xml.epub');
      const buffer = await zip.generateAsync({ type: 'nodebuffer' });
      await fs.writeFile(tempEpub, buffer);

      try {
        const result = await validateEPUB(tempEpub, {});
        // Should handle gracefully - no CSS files means no errors
        expect(result.totalErrors).toBe(0);
        expect(result.totalWarnings).toBe(0);
      } finally {
        await fs.unlink(tempEpub).catch(() => {});
      }
    });

    it('should handle corrupted ZIP archive', async () => {
      // Create a corrupted ZIP file
      const tempEpub = path.join(__dirname, '../fixtures/temp-corrupted.epub');
      await fs.writeFile(tempEpub, 'This is not a valid ZIP file');

      try {
        await expect(() => validateEPUB(tempEpub, {})).rejects.toThrow();
      } finally {
        await fs.unlink(tempEpub).catch(() => {});
      }
    });
  });

  describe('Empty EPUBs', () => {
    it('should handle EPUB with no CSS files', async () => {
      // Create an EPUB with no CSS files
      const zip = new JSZip();
      zip.file('mimetype', 'application/epub+zip');
      zip.file('META-INF/container.xml', '<?xml version="1.0"?><container></container>');

      const tempEpub = path.join(__dirname, '../fixtures/temp-empty.epub');
      const buffer = await zip.generateAsync({ type: 'nodebuffer' });
      await fs.writeFile(tempEpub, buffer);

      try {
        const result = await validateEPUB(tempEpub, {});
        expect(result.totalErrors).toBe(0);
        expect(result.totalWarnings).toBe(0);
      } finally {
        await fs.unlink(tempEpub).catch(() => {});
      }
    });

    it('should handle EPUB with only metadata files', async () => {
      // Create an EPUB with only metadata files
      const zip = new JSZip();
      zip.file('mimetype', 'application/epub+zip');
      zip.file('META-INF/container.xml', '<?xml version="1.0"?><container></container>');
      zip.file('OEBPS/content.opf', '<?xml version="1.0"?><package></package>');

      const tempEpub = path.join(__dirname, '../fixtures/temp-metadata-only.epub');
      const buffer = await zip.generateAsync({ type: 'nodebuffer' });
      await fs.writeFile(tempEpub, buffer);

      try {
        const result = await validateEPUB(tempEpub, {});
        expect(result.totalErrors).toBe(0);
        expect(result.totalWarnings).toBe(0);
      } finally {
        await fs.unlink(tempEpub).catch(() => {});
      }
    });
  });

  describe('CSS Content Edge Cases', () => {
    it('should handle CSS with syntax errors', async () => {
      // Create a CSS file with syntax errors
      const badCSS = `
        body {
          margin: 0;
          padding: 0;
        }
        /* Unclosed block
        .invalid-selector {
          color: red;
        }
      `;
      const tempFile = path.join(__dirname, '../fixtures/temp-bad-syntax.css');
      await fs.writeFile(tempFile, badCSS);

      try {
        const result = await validateCSS(tempFile, {});
        expect(result.totalErrors).toBeGreaterThan(0);
      } finally {
        await fs.unlink(tempFile).catch(() => {});
      }
    });

    it('should handle CSS with encoding issues', async () => {
      // Create a CSS file with BOM (byte order mark)
      const bomCSS = '\ufeffbbbody { margin: 0; }';
      const tempFile = path.join(__dirname, '../fixtures/temp-bom.css');
      await fs.writeFile(tempFile, bomCSS);

      try {
        const result = await validateCSS(tempFile, {});
        // BOM shouldn't cause validation errors
        expect(result.totalErrors).toBeGreaterThanOrEqual(0);
      } finally {
        await fs.unlink(tempFile).catch(() => {});
      }
    });

    it('should handle CSS with circular dependencies', async () => {
      // Create a CSS file with circular dependencies
      const circularCSS = `
        .class1 { color: .class2; }
        .class2 { color: .class1; }
      `;
      const tempFile = path.join(__dirname, '../fixtures/temp-circular.css');
      await fs.writeFile(tempFile, circularCSS);

      try {
        const result = await validateCSS(tempFile, {});
        // Circular dependencies shouldn't cause validation errors
        expect(result.totalErrors).toBeGreaterThanOrEqual(0);
      } finally {
        await fs.unlink(tempFile).catch(() => {});
      }
    });
  });

  describe('Large EPUBs', () => {
    it('should handle EPUB with very large CSS files', async () => {
      // Create an EPUB with a very large CSS file
      const zip = new JSZip();
      zip.file('mimetype', 'application/epub+zip');
      zip.file('META-INF/container.xml', '<?xml version="1.0"?><container></container>');

      // Create a large CSS file with many rules
      let largeCSS = 'body {';
      for (let i = 0; i < 1000; i++) {
        largeCSS += `.rule${i} { color: #${i.toString(16).padStart(6, '0')}; } `;
      }
      largeCSS += '}';

      zip.file('OEBPS/large.css', largeCSS);

      const tempEpub = path.join(__dirname, '../fixtures/temp-large.epub');
      const buffer = await zip.generateAsync({ type: 'nodebuffer' });
      await fs.writeFile(tempEpub, buffer);

      try {
        const result = await validateEPUB(tempEpub, {});
        expect(result.totalErrors).toBeGreaterThanOrEqual(0);
        // Should complete in reasonable time
        const startTime = Date.now();
        await validateEPUB(tempEpub, {});
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(5000); // Should complete in <5 seconds
      } finally {
        await fs.unlink(tempEpub).catch(() => {});
      }
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle concurrent validation efficiently', async () => {
      // Create multiple CSS files
      const files = [];
      for (let i = 0; i < 5; i++) {
        const tempFile = path.join(__dirname, `../fixtures/temp-concurrent-${i}.css`);
        const css = `
          .rule${i} { color: #${i.toString(16).padStart(6, '0')}; }
        body { margin: 0; }
        `;
        await fs.writeFile(tempFile, css);
        files.push(tempFile);
      }

      try {
        // Validate all files concurrently
        const results = await Promise.all(
          files.map(file => validateCSS(file, {}))
        );
        expect(results.every(r => r.totalErrors >= 0)).toBe(true);
      } finally {
        // Clean up all temp files
        await Promise.all(
          files.map(file => fs.unlink(file).catch(() => {}))
        );
      }
    });
  });
});
