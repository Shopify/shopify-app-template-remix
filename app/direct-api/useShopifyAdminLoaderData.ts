// This would be provided by shopify-app-remix

import { useLoaderData } from "@remix-run/react";
import { useCallback, useEffect, useState } from "react";

// PROBLEM: Missing API version, retries & headers.  Maybe that's ok?
// Without these, the API is inconsistent with the server side.
interface GraphQLQueryOptions {
  variables?: {
    [key: string]: any;
  };
}

type JSONValue = string | number | boolean | null | JSONArray | JSONObject;
interface JSONArray extends Array<JSONValue> {}
interface JSONObject {
  [key: string]: JSONValue;
}

interface Data<loaderData> {
  loader: ReturnType<typeof useLoaderData<loaderData>>;

  // TODO: Type the GraphQL Response
  graphql?: JSONValue | (() => Promise<JSONValue>);
}

const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

export function useAdminLoaderData<loaderData>(
  query?: string,
  options?: GraphQLQueryOptions
): Data<loaderData> {
  const loader = useLoaderData<loaderData>();

  const fetchGraphql = useCallback(
    async function graphql() {
      if (!isBrowser || !query) {
        return undefined;
      }

      shopify.loading(true);

      const response = await fetch("shopify:admin/api/graphql.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables: options?.variables }),
      });

      setState({
        ...state,
        admin: (await response.json()) as JSONValue,
      });

      shopify.loading(false);

      return undefined;
    },
    [query, options?.variables, JSON.stringify(loader)]
  );

  const [state, setState] = useState(() => ({
    loader,
    admin: fetchGraphql(),
  }));

  useEffect(() => {
    fetchGraphql();
  }, [query, fetchGraphql]);

  return state;
}
