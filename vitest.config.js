import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 10000,
    include: ['tests/**/*.test.js', 'tests/**/*.test.ts'],
    deps: {
      // Externalize everything inside node_modules to avoid source map warnings
      external: [/\/node_modules\//],
      interopDefault: true
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: './tests/coverage',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.test.js',
        '*.test.ts',
        '*.config.js',
        '*.config.ts'
      ]
    }
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  css: {
    include: [/\.css$/]
  }
});
