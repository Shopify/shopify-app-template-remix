import { defineConfig, mergeConfig } from 'vitest/config';
import rootConfig from '../../vitest.config';
import path from 'node:path';

export default mergeConfig(
  rootConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['*.test.?(c|m)[jt]s?(x)', '**/*.test.?(c|m)[jt]s?(x)'],
      setupFiles: [
        '../test-utilities/shopify.setup.js',
        '../test-utilities/testing-library.setup.js',
      ],
    },
    resolve: {
      alias: {
        '@testing-library/polaris': path.resolve(
          __dirname,
          '../test-utilities/testing-library-polaris.jsx'
        ),
      },
    },
  })
);