export const PLAN_1 = "Shopify app plan 1";
export const PLAN_2 = "Shopify app plan 2";
export const ALL_PLANS = [PLAN_1, PLAN_2];

export const CONFIRMATION_URL = "totally-real-url";

export const EMPTY_SUBSCRIPTIONS = JSON.stringify({
  data: {
    currentAppInstallation: {
      oneTimePurchases: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
      activeSubscriptions: [],
      userErrors: [],
    },
  },
});

export const EXISTING_SUBSCRIPTION = JSON.stringify({
  data: {
    currentAppInstallation: {
      oneTimePurchases: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
      activeSubscriptions: [{ id: "gid://123", name: PLAN_1, test: true }],
    },
  },
});

export const PURCHASE_SUBSCRIPTION_RESPONSE = JSON.stringify({
  data: {
    appSubscriptionCreate: {
      appSubscription: {
        id: "gid://123",
        name: PLAN_1,
        test: true,
      },
      confirmationUrl: CONFIRMATION_URL,
      userErrors: [],
    },
  },
});

export const PURCHASE_SUBSCRIPTION_RESPONSE_WITH_USER_ERRORS = JSON.stringify({
  data: {
    appSubscriptionCreate: {
      appSubscription: {
        id: "gid://123",
        name: PLAN_1,
        test: true,
      },
      confirmationUrl: CONFIRMATION_URL,
      userErrors: ["Oops, something went wrong"],
    },
  },
});
