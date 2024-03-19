# Testing Shopify App Template - Remix

This is a template for testing [Shopify apps](https://shopify.dev/docs/apps/getting-started) built using the [Remix](https://remix.run) framework.

This template demonstrates how to use Vitest, Testing Library, and `@remix-run/testing` to test routes and components built with Polaris components, and how to use Playwright to do end-to-end testing for Shopify apps.

## Quick start

### Prerequisites
You must [initialise a Remix app using the Shopify CLI](https://shopify.dev/docs/apps/getting-started/create).

### Setup
Run `npm init playwright`, choose `test/e2e` as your test folder when asked, and don't overwrite `playwright.config.ts` when prompted.

### Route and component testing
1. From your command line, run `npx vitest` to test routes and components.

`/tests/routes/AdditionalPage.test.jsx` provides an example test. You can duplicate the `tests/routes` directory if you wish to organise your test files in multiple directories.

### End-to-end testing
1. Run `npm run predev`.
1. From your command line, run `npx playwright test` for end-to-end testing.

`example.test.ts` provides an example test. You can duplicate this file if you wish to add additional tests.

## (In)frequently Asked Questions
- What is `@testing-library/polaris`?

  `@testing-library/polaris` is not a real package. It is a Vitest alias and TypeScript path set up in config files for convenience.

- Why are you using Vitest workspaces?

  Vitest workspaces contain the `@testing-library/polaris` alias and the Shopify mocks to the directories with Polaris and Shopify tests.

- Why do I need to run `npm run predev`?

  In a Shopify Remix app project, `npm run dev` and `npm run shopify dev` apply Prisma migrations. If you haven't yet run either of these commands in your project, you need to manually apply the Prisma migrations by running `npm run predev` before running Playwright. 

## Resources
- [Vitest](https://vitest.dev/guide/)
- [Remix testing](https://testing.epicweb.dev/07)
- [Testing Library](https://testing-library.com/docs/learning/)
- [Testing Library Vitest/Jest matchers](https://github.com/testing-library/jest-dom#custom-matchers)
- [Playwright](https://playwright.dev/docs/intro)