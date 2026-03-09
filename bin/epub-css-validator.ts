#!/usr/bin/env node

/**
 * EPUB CSS Validator - CLI Entry Point
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

import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import stylelint from 'stylelint';
import {
  validateCSS,
  validateEPUB,
  updateConfig,
  getCachedConfigInfo,
  formatJUnit,
  type ValidationOptions
} from '../lib/core.js';

const program = new Command();

program
  .name('epub-css-validator')
  .description('Validate CSS in EPUB files using Calibre\'s stylelint rules')
  .version('1.0.0');

program
  .argument('[files...]', 'CSS files, directories, or EPUB files to validate')
  .option('-f, --format <format>', 'Output format: text, json, junit', 'text')
  .option('-u, --update-config', 'Update Calibre\'s stylelint config from GitHub')
  .option('-c, --config <path>', 'Use custom stylelint config file')
  .option('-v, --verbose', 'Verbose output')
  .option('--cache-info', 'Show cached Calibre config information')
  .action(async (files: string[], options: ValidationOptions & { updateConfig?: boolean; cacheInfo?: boolean }) => {
    try {
      // Handle --update-config flag
      if (options.updateConfig) {
        console.log(chalk.blue('Updating Calibre stylelint config...'));
        await updateConfig();
        console.log(chalk.green('✓ Config updated successfully'));
        return;
      }

      // Handle --cache-info flag
      if (options.cacheInfo) {
        const info = await getCachedConfigInfo();
        if (info) {
          console.log(chalk.blue('Cached Calibre Config:'));
          console.log(`  Version: ${chalk.yellow(info.version)}`);
          console.log(`  Cached: ${chalk.yellow(info.cachedAt)}`);
          console.log(`  Path: ${chalk.yellow(info.path)}`);
        } else {
          console.log(chalk.yellow('No cached config found. Run --update-config to fetch it.'));
        }
        return;
      }

      // Validate files
      if (!files || files.length === 0) {
        console.error(chalk.red('Error: No files specified'));
        program.help();
        return;
      }

      let totalErrors = 0;
      let totalWarnings = 0;

      for (const file of files) {
        const filePath = path.resolve(file);
        const ext = path.extname(filePath).toLowerCase();

        if (ext === '.epub') {
          console.log(chalk.blue(`Validating EPUB: ${file}`));
          const result = await validateEPUB(filePath, options);
          totalErrors += result.totalErrors;
          totalWarnings += result.totalWarnings;
          // Display EPUB errors if any
          if (result.totalErrors > 0 || result.totalWarnings > 0) {
            displayErrors(result.results?.[0], filePath);
          }
        } else if (ext === '.css') {
          console.log(chalk.blue(`Validating CSS: ${file}`));
          const result = await validateCSS(filePath, options);
          totalErrors += result.totalErrors;
          totalWarnings += result.totalWarnings;
          // Display CSS errors if any
          if (result.totalErrors > 0 || result.totalWarnings > 0) {
            displayErrors(result.results?.[0], filePath);
          }
        } else {
          console.log(chalk.yellow(`Skipping ${file} (not a CSS or EPUB file)`));
        }
      }

      // Summary
      console.log();
      if (totalErrors === 0 && totalWarnings === 0) {
        console.log(chalk.green('✓ No CSS errors or warnings found'));
      } else {
        if (totalErrors > 0) {
          console.log(chalk.red(`✗ ${totalErrors} error(s)`));
        }
        if (totalWarnings > 0) {
          console.log(chalk.yellow(`⚠ ${totalWarnings} warning(s)`));
        }
      }

      // Exit with error code if there are errors
      process.exit(totalErrors > 0 ? 1 : 0);

    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      if (options.verbose) {
        console.error((error as Error).stack);
      }
      process.exit(1);
    }
  });

/**
 * Display validation errors to console
 */
function displayErrors(result: stylelint.LintResult | undefined, filePath: string): void {
  if (!result || !result.warnings || result.warnings.length === 0) {
    return;
  }

  console.log(result.source || filePath);
  result.warnings.forEach((warning: stylelint.Warning) => {
    // Filter out "Unknown rule" warnings (deprecated rules in Calibre's config)
    if (warning.text.includes('Unknown rule')) {
      return;
    }
    const severity = warning.severity === 'error' ? '✖' : '⚠';
    console.log(`  ${warning.line}:${warning.column}  ${severity}  ${warning.text}  ${warning.rule}`);
  });
}

program.parse();
