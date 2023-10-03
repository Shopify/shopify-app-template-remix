// NOTE: This would be provided by shopify-app-remix

import { useFetcher } from "@remix-run/react";
import { useCallback, useMemo } from "react";

interface GraphQLQueryOptions {
  variables?: {
    [key: string]: any;
  };
}

export function useShopifyAdminFetcher() {
  const { submit, state, data } = useFetcher();

  const graphql = useCallback(
    (query: string, options: GraphQLQueryOptions) => {
      submit(
        { query, variables: options.variables || null },
        {
          method: "POST",
          encType: "application/json",

          // PROBLEM: React router thinks this is a relative path
          // No matter what I do, it parses this incorrectly
          action: "shopify:admin/api/graphql.json",
        }
      );
    },
    [submit]
  );

  return useMemo(
    () => ({
      state,
      data,
      graphql,
    }),
    [data, graphql, state]
  );
}
