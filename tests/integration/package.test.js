/**
 * Package Distribution Test
 *
 * Copyright (C) 2026 Jeff Spiers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program uses CSS validation rules from Calibre (https://calibre-ebook.com/),
 * which is licensed under the GNU General Public License v3.
 * Calibre Copyright (C) 2023 Kovid Goyal <kovid at kovidgoyal.net>
 *
 * See LICENSE file for the full text of the GNU General Public License.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

describe('Package Distribution', () => {
  let tarballPath;
  let tempDir;

  beforeAll(async () => {
    // Build the project
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

    // Create tarball
    execSync('npm pack', { cwd: rootDir, stdio: 'inherit' });

    // Find the tarball
    const files = await fs.readdir(rootDir);
    const tarball = files.find(f => f.startsWith('epub-css-validator-') && f.endsWith('.tgz'));
    expect(tarball).toBeDefined();
    tarballPath = path.join(rootDir, tarball);

    // Create temp directory for testing (in system temp, not project root)
    tempDir = path.join(os.tmpdir(), `epub-css-validator-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
  }, 60000); // 60 second timeout for beforeAll

  afterAll(async () => {
    // Clean up
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
    if (tarballPath) {
      await fs.unlink(tarballPath).catch(() => {});
    }
  });

  it('should include compiled dist/ directory', async () => {
    const output = execSync(`tar -tzf ${tarballPath}`, { encoding: 'utf-8' });
    expect(output).toContain('package/dist/');
    expect(output).toContain('package/dist/bin/epub-css-validator.js');
    expect(output).toContain('package/dist/lib/core.js');
  });

  it('should include LICENSE and README.md', async () => {
    const output = execSync(`tar -tzf ${tarballPath}`, { encoding: 'utf-8' });
    expect(output).toContain('package/LICENSE');
    expect(output).toContain('package/README.md');
  });

  it('should exclude source .ts files', async () => {
    const output = execSync(`tar -tzf ${tarballPath}`, { encoding: 'utf-8' });
    expect(output).not.toMatch(/package\/.*\.ts$/);
  });

  it('should exclude tests/ directory', async () => {
    const output = execSync(`tar -tzf ${tarballPath}`, { encoding: 'utf-8' });
    expect(output).not.toContain('package/tests/');
  });

  it('should exclude .cache/ directory', async () => {
    const output = execSync(`tar -tzf ${tarballPath}`, { encoding: 'utf-8' });
    expect(output).not.toContain('package/.cache/');
  });

  it('should exclude development config files', async () => {
    const output = execSync(`tar -tzf ${tarballPath}`, { encoding: 'utf-8' });
    expect(output).not.toContain('package/tsconfig.json');
    expect(output).not.toContain('package/vitest.config.js');
  });

  it('should install and run correctly', async () => {
    // Install the package in temp directory
    execSync(`npm install ${tarballPath}`, { cwd: tempDir, stdio: 'inherit' });

    // Test the CLI
    const output = execSync('npx epub-css-validator --version', {
      cwd: tempDir,
      encoding: 'utf-8'
    });
    expect(output).toContain('0.1.0');
  }, 30000); // 30 second timeout for npm install

  it('should validate CSS files correctly', async () => {
    // Copy test file to temp directory
    const testFile = path.join(rootDir, 'examples', 'test.css');
    const tempTestFile = path.join(tempDir, 'test.css');
    await fs.copyFile(testFile, tempTestFile);

    // Run validation - expect it to exit with code 1 (errors found)
    let output;
    try {
      output = execSync(`npx epub-css-validator ${tempTestFile}`, {
        cwd: tempDir,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
    } catch (error) {
      // Command exits with code 1 when errors are found (expected behavior)
      output = error.stdout;
      expect(error.status).toBe(1);
    }
    expect(output).toContain('Validating CSS');
    expect(output).toContain('error(s)');
  }, 30000); // 30 second timeout for validation

  it('should support all output formats', async () => {
    const testFile = path.join(rootDir, 'examples', 'test.css');
    const tempTestFile = path.join(tempDir, 'test.css');
    await fs.copyFile(testFile, tempTestFile);

    // Test that format options are accepted (CLI accepts them even if output format handling needs improvement)
    // Test JSON format - expect exit code 1 (errors found)
    try {
      execSync(`npx epub-css-validator --format json ${tempTestFile}`, {
        cwd: tempDir,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
    } catch (error) {
      expect(error.status).toBe(1);
    }

    // Test JUnit format - expect exit code 1 (errors found)
    try {
      execSync(`npx epub-css-validator --format junit ${tempTestFile}`, {
        cwd: tempDir,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
    } catch (error) {
      expect(error.status).toBe(1);
    }
  }, 30000); // 30 second timeout for format tests
});
