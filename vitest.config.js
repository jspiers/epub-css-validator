import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 10000,
    include: ['tests/**/*.test.js', 'tests/**/*.test.ts'],
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
  ssr: {
    noExternal: true,
    external: ['cosmiconfig', 'table']
  },
  deps: {
    interopDefault: true
  },
  css: {
    include: [/\.css$/]
  },
  server: {
    sourcemap: {
      ignore: [/node_modules/]
    }
  },
  optimizeDeps: {
    include: []
  },
  build: {
    sourcemap: false
  },
  esbuild: {
    sourcemap: false
  },
  define: {
    'process.env.NODE_ENV': '"test"'
  }
});
