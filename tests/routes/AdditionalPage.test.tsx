import { beforeEach, test, expect } from 'vitest';
import { render, screen } from '@testing-library/polaris';
import { createRemixStub } from '@remix-run/testing';
import AdditionalPage from '~/routes/app.additional';

let App: ReturnType<typeof createRemixStub>;

beforeEach(() => {
  App = createRemixStub([
    {
      path: '/',
      Component: AdditionalPage,
      action: () => null,
    },
  ]);
});

test('Can test exported Remix route/component containing Polaris components', async () => {
  render(<App initialEntries={['/']} />);
  const list = await screen.getByRole('list');
  const listItem = await screen.getByRole('listitem');
  screen.debug();
  expect(list).toContainElement(listItem);
});
