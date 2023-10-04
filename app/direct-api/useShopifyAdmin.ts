// NOTE: This would be provided by shopify-app-remix

import { useRevalidator } from "@remix-run/react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface GraphQLQueryOptions {
  variables?: {
    [key: string]: any;
  };
}

enum State {
  Idle = "idle",
  Submitting = "submitting",
  Loading = "loading",
}

interface Response {
  data: any;
  extensions: any;
}

interface ReturnValue extends Response {
  state: State;
  graphql: (query: string, options: GraphQLQueryOptions) => void;
}

export function useShopifyAdmin(): ReturnValue {
  const { revalidate, state: revalidatorState } = useRevalidator();
  const [fetching, setFetching] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [response, setResponse] = useState<Response>({
    data: undefined,
    extensions: undefined,
  });

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

      const { data, extensions }: Response = await response.json();

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
    let state = State.Idle;

    if (fetching) {
      state = State.Submitting;
    } else if (revalidating) {
      state = State.Loading;
    }

    return {
      ...response,
      state,
      graphql,
    };
  }, [response, fetching, revalidating, graphql]);
}
