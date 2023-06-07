/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
  root: true,
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    '@remix-run/eslint-config/jest-testing-library',
    'plugin:@shopify/prettier',
    'plugin:@shopify/typescript',
    'plugin:@shopify/polaris',
  ],
  rules: {
    '@shopify/images-no-direct-imports': 'off',
    '@shopify/binary-assignment-parens': 'off',
    'no-process-env': 'off',
    'import/extensions': 'off',
  },
};
