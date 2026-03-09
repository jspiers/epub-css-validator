/**
 * EPUB CSS Validator - Core Validation Logic
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

import stylelint from 'stylelint';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import { glob } from 'glob';

// ESM polyfills for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CALIBRE_REPO = 'kovidgoyal/calibre';
const CONFIG_PATH = 'resources/stylelint.js';
const CACHE_DIR = path.join(__dirname, '../.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'calibre-stylelint.js');
const CACHE_INFO_FILE = path.join(CACHE_DIR, 'cache-info.json');

/**
 * Fetch Calibre's stylelint config from GitHub
 */
export async function fetchCalibreConfig() {
  const url = `https://raw.githubusercontent.com/${CALIBRE_REPO}/master/${CONFIG_PATH}`;
  const response = await axios.get(url);
  return response.data;
}

/**
 * Get cached Calibre config
 */
export async function getCachedConfig() {
  try {
    return await fs.readFile(CACHE_FILE, 'utf-8');
  } catch (error) {
    return null;
  }
}

/**
 * Get cached config information
 */
export async function getCachedConfigInfo() {
  try {
    const info = await fs.readFile(CACHE_INFO_FILE, 'utf-8');
    return JSON.parse(info);
  } catch (error) {
    return null;
  }
}

/**
 * Update cached Calibre config
 */
export async function updateConfig() {
  const config = await fetchCalibreConfig();

  // Create cache directory if it doesn't exist
  await fs.mkdir(CACHE_DIR, { recursive: true });

  // Save config
  await fs.writeFile(CACHE_FILE, config);

  // Save cache info with version
  const info = {
    version: await getLatestCalibreVersion(),
    cachedAt: new Date().toISOString(),
    path: CACHE_FILE
  };
  await fs.writeFile(CACHE_INFO_FILE, JSON.stringify(info, null, 2));

  return config;
}

/**
 * Get latest Calibre version from GitHub API
 */
export async function getLatestCalibreVersion() {
  try {
    const response = await axios.get(`https://api.github.com/repos/${CALIBRE_REPO}/commits/master`);
    return response.data.sha.substring(0, 7);
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Extract rules from Calibre's config content
 */
export function extractRules(configContent) {
  try {
    // Calibre's config is wrapped in a browser-style IIFE
    // We need to extract the rules object from it
    // Find the rules section and extract it with proper bracket matching
    const rulesStart = configContent.indexOf('rules:');
    if (rulesStart === -1) {
      return {};
    }

    let depth = 0;
    let inRules = false;
    let rulesContent = '';
    let i = rulesStart + 6; // Skip 'rules:'

    // Find the opening brace
    while (i < configContent.length && configContent[i] !== '{') {
      i++;
    }
    if (i >= configContent.length) {
      return {};
    }

    depth = 1;
    i++; // Skip the opening brace

    // Extract content until we find the matching closing brace
    while (i < configContent.length && depth > 0) {
      const char = configContent[i];
      if (char === '{') {
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0) {
          break;
        }
      }
      rulesContent += char;
      i++;
    }

    // Parse the rules object safely
    const rulesStr = `{${rulesContent}}`;
    const rules = new Function(`return ${rulesStr}`)();
    return rules;
  } catch (error) {
    console.warn('Warning: Could not parse Calibre config, using default rules');
    if (process.env.DEBUG) {
      console.warn('Error details:', error.message);
    }
    return getDefaultRules();
  }
}

/**
 * Get default stylelint rules (fallback)
 */
export function getDefaultRules() {
  return {
    'property-no-unknown': true,
    'block-no-empty': true,
    'selector-type-no-unknown': [true, { ignore: ['custom-elements'] }],
    'color-no-invalid-hex': true,
    'declaration-block-no-duplicate-properties': true,
    'function-no-unknown': true,
    'unit-no-unknown': true,
  };
}

/**
 * Validate a CSS file (core function - no console output)
 */
export async function validateCSS(filePath, options = {}) {
  let config;

  if (options.config) {
    // Use custom config
    const customConfigContent = await fs.readFile(options.config, 'utf-8');
    config = { rules: extractRules(customConfigContent) };
  } else {
    // Use Calibre's config
    const calibreConfig = await getCachedConfig() || await updateConfig();
    config = { rules: extractRules(calibreConfig) };
  }

  const result = await stylelint.lint({
    files: filePath,
    config: config,
    report: options.format === 'json' ? 'json' : 'text'
  });

  const output = result.results[0];

  // Filter out "Unknown rule" warnings (deprecated rules in Calibre's config)
  const filteredWarnings = output && output.warnings
    ? output.warnings.filter(w => !w.text.includes('Unknown rule'))
    : [];

  const errorCount = filteredWarnings.filter(w => w.severity === 'error').length;
  const warningCount = filteredWarnings.filter(w => w.severity === 'warning').length;

  return {
    totalErrors: errorCount,
    totalWarnings: warningCount,
    results: result.results
  };
}

/**
 * Validate all CSS files in a directory
 */
export async function validateDirectory(dirPath, options = {}) {
  const cssFiles = glob.sync('**/*.css', {
    cwd: dirPath,
    absolute: true
  });

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of cssFiles) {
    const result = await validateCSS(file, options);
    totalErrors += result.totalErrors;
    totalWarnings += result.totalWarnings;
  }

  return { totalErrors, totalWarnings };
}

/**
 * Validate CSS in an EPUB file (core function - no console output)
 */
export async function validateEPUB(epubPath, options = {}) {
  const data = await fs.readFile(epubPath);
  const zip = await JSZip.loadAsync(data);

  const cssFiles = [];
  zip.forEach((relativePath, file) => {
    if (relativePath.endsWith('.css') && !file.dir) {
      cssFiles.push(file);
    }
  });

  let totalErrors = 0;
  let totalWarnings = 0;

  if (cssFiles.length === 0) {
    return { totalErrors: 0, totalWarnings: 0 };
  }

  for (const file of cssFiles) {
    const content = await file.async('string');

    // Write to temp file for stylelint
    const tempFile = path.join(CACHE_DIR, `temp-${Date.now()}.css`);
    await fs.writeFile(tempFile, content);

    try {
      const result = await validateCSS(tempFile, options);
      totalErrors += result.totalErrors;
      totalWarnings += result.totalWarnings;
    } finally {
      // Clean up temp file
      await fs.unlink(tempFile).catch(() => {});
    }
  }

  return { totalErrors, totalWarnings };
}

/**
 * Format results as JUnit XML
 */
export function formatJUnit(result, filePath) {
  const testCases = [];

  for (const fileResult of result.results) {
    for (const warning of fileResult.warnings) {
      testCases.push({
        name: `${warning.rule} - line ${warning.line}`,
        failure: {
          message: warning.text,
          type: warning.severity
        }
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="${filePath}" tests="${testCases.length}" failures="${testCases.length}">
${testCases.map(tc => `    <testcase name="${tc.name}">
      <failure message="${tc.failure.message}" type="${tc.failure.type}"/>
    </testcase>`).join('\n')}
  </testsuite>
</testsuites>`;

  return xml;
}
