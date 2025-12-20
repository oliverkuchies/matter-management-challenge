import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.spec.tsx',
        '**/*.spec.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/mocks/**',
      ],
    },
  },
});
