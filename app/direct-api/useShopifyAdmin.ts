// NOTE: This would be provided by shopify-app-remix

import { useCallback, useMemo, useState } from "react";

interface GraphQLQueryOptions {
  variables?: {
    [key: string]: any;
  };
}

export function useShopifyAdmin() {
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [data, setData] = useState<undefined | any>(undefined);
  const [extensions, setExtensions] = useState<undefined | any>(undefined);

  const graphql = useCallback(
    async (query: string, options: GraphQLQueryOptions) => {
      setState("loading");

      const response = await window.fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables: options?.variables }),
      });

      const { data, extensions } = await response.json();

      // TODO: When/How should we revalidate()
      // Should we return data before revalidating?

      // TODO: Type data
      setData(data);

      // TODO: Type extensions
      setExtensions(extensions);
      setState("idle");
    },
    []
  );

  // TODO: What other API's do we want here?
  return useMemo(
    () => ({
      state,
      data,
      extensions,
      graphql,
    }),
    // Whenever state changes, data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, graphql]
  );
}
