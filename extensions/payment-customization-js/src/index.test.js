import { describe, it, expect } from 'vitest';
import paymentCustomization from './index';

/**
 * @typedef {import("../generated/api").FunctionResult} FunctionResult
 */

describe('payment customization function', () => {
  it('returns no operations without configuration', () => {
    const result = paymentCustomization({
      paymentCustomization: {
        metafield: null
      }
    });
    const expected = /** @type {FunctionResult} */ ({ operations: [] });

    expect(result).toEqual(expected);
  });
});