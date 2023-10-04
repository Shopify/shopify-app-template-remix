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
  const revalidator = useRevalidator();
  const [state, setState] = useState<"idle" | "loading" | "submitting">("idle");
  const [data, setData] = useState<any>();
  const [extensions, setExtensions] = useState<any>();
  const [response, setResponse] = useState<undefined | Response>();

  const graphql = useCallback(
    async (query: string, options: GraphQLQueryOptions) => {
      setState("submitting");

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
        revalidator.revalidate();
        setState("loading");
        setResponse({ data, extensions });
      } else {
        setState("idle");
        setResponse({ data, extensions });
        setData(data);
        setExtensions(extensions);
      }
    },
    []
  );

  useEffect(() => {
    // TODO: Is this correct?
    // Here we only update the data when revalidation finishes
    // Should we update the data earlier?
    if (state === "loading" && revalidator.state === "idle") {
      setData(response?.data);
      setExtensions(response?.extensions);
      setState("idle");
    }
  }, [state, revalidator.state, response?.data, response?.extensions]);

  // TODO: What other API's do we want here?
  return useMemo(
    () => ({
      data,
      extensions,
      state,
      graphql,
    }),
    // Whenever state changes, data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );
}
