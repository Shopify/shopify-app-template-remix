import { setCrypto } from "@shopify/shopify-api/runtime";

describe('node setup import', () => {
  let previousCrypto: any;

  beforeAll(() => {
    previousCrypto = (require('@shopify/shopify-api/runtime')).crypto;
    setCrypto(undefined as any);
  });

  afterAll(() => {
    setCrypto(previousCrypto);
  });

  it('sets up the crypto library only when the import is called', async () => {
    // GIVEN
    const cryptoBefore = (await require('@shopify/shopify-api/runtime')).crypto;
    expect(cryptoBefore).toBeUndefined();

    // WHEN
    await require('../node');

    // THEN
    const cryptoAfter = (await require('@shopify/shopify-api/runtime')).crypto;
    expect(cryptoAfter).toBeDefined();
  });
});
