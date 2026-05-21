import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Page, Text } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import withPrivilege from "app/components/withPrivilege";
import { restrictedItem } from "app/configs/privilege.config";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {};

function RestrictedPage() {
  return (
    <Page>
      <TitleBar title="Sample Restricted Page" />
      <Text variant="bodyLg" as="p">
        You need specific privileges to access this page.
      </Text>
    </Page>
  );
}

export default withPrivilege(restrictedItem.page.restricted, RestrictedPage);
