/**
 * Checkout UI Extension - Example checkout enhancement
 * Demonstrates how to add custom functionality to the checkout flow
 */

import {
  reactExtension,
  Banner,
  Button,
  Text,
  useApi,
  useShop,
  useCustomer,
  useCartLines,
  useApplyCartLinesChange,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <CheckoutExtension />
);

function CheckoutExtension() {
  const { i18n } = useApi();
  const shop = useShop();
  const customer = useCustomer();
  const cartLines = useCartLines();
  const applyCartLinesChange = useApplyCartLinesChange();

  // Calculate total items in cart
  const totalItems = cartLines.reduce((total, line) => total + line.quantity, 0);

  // Example: Add a promotional message based on cart value
  const cartTotal = cartLines.reduce((total, line) => {
    return total + (line.cost.totalAmount.amount * line.quantity);
  }, 0);

  const showFreeShippingBanner = cartTotal < 50 && cartTotal > 0;
  const freeShippingRemaining = 50 - cartTotal;

  return (
    <>
      {/* Welcome message for logged-in customers */}
      {customer && (
        <Banner status="info">
          <Text>
            Welcome back, {customer.firstName || 'valued customer'}! 
            Thank you for shopping with {shop.name}.
          </Text>
        </Banner>
      )}

      {/* Free shipping promotion */}
      {showFreeShippingBanner && (
        <Banner status="success">
          <Text>
            You're ${freeShippingRemaining.toFixed(2)} away from free shipping!
          </Text>
        </Banner>
      )}

      {/* Cart summary */}
      <Text size="medium" emphasis="strong">
        Cart Summary: {totalItems} items
      </Text>

      {/* Example action button */}
      <Button
        kind="secondary"
        onPress={() => {
          // Example: Track checkout event
          console.log('Checkout extension interaction:', {
            shop: shop.name,
            customer: customer?.id,
            cartTotal,
            totalItems,
          });
        }}
      >
        Continue Shopping
      </Button>
    </>
  );
} 