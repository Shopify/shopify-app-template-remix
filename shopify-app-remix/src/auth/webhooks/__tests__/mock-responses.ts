export const EMPTY_WEBHOOK_RESPONSE = {
  data: {
    webhookSubscriptions: {
      edges: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    },
  },
};

export const HTTP_WEBHOOK_CREATE_RESPONSE = {
  data: {
    webhookSubscriptionCreate: {
      webhookSubscription: { id: "fakeId" },
      userErrors: [],
    },
  },
};

export const HTTP_WEBHOOK_CREATE_ERROR_RESPONSE = {
  data: {
    webhookSubscriptionCreate: {
      webhookSubscription: null,
      userErrors: [
        {
          field: ["webhookSubscriptionCreate", "webhookSubscription"],
          message: "Webhook topic is invalid",
        },
      ],
    },
  },
};
