// NOTE: This would be provided by shopify-app-remix

import { useRevalidator } from "@remix-run/react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface GraphQLQueryOptions {
  variables?: {
    [key: string]: any;
  };
}

interface Response {
  data: any;
  extensions: any;
}

export function useShopifyAdmin() {
  const { revalidate, state: revalidatorState } = useRevalidator();
  const [fetching, setFetching] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [response, setResponse] = useState<undefined | Response>();

  const graphql = useCallback(
    async (query: string, options: GraphQLQueryOptions) => {
      setFetching(true);

      const response = await window.fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables: options?.variables }),
      });

      const { data, extensions } = await response.json();

      // TODO: Do we need to only return new state after revalidation?
      // Need to be 100% sure how this works with use Fetcher()
      if (query.includes("mutation")) {
        setRevalidating(true);
        revalidate();
      }

      setFetching(false);
      setResponse({ data, extensions });
    },
    [revalidate]
  );

  useEffect(() => {
    if (revalidatorState === "idle") {
      setRevalidating(false);
    }
  }, [revalidatorState]);

  return useMemo(() => {
    let state = "idle";

    if (fetching) {
      state = "submitting";
    } else if (revalidating) {
      state = "loading";
    }

    return {
      ...response,
      state,
      graphql,
    };
  }, [response, fetching, revalidating, graphql]);
}
