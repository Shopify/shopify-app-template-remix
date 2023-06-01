import React from "react";
import { AlphaCard, Link, Page, Layout, Text } from "@shopify/polaris";
import { useNavigate } from "@remix-run/react";

export default function Info() {
  const navigate = useNavigate();

  // this is the only form of navigation that re-fetches the auth headers + data etc
  const navigateToHome = () => {
    navigate("/");
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <AlphaCard>
            <Text as="h3">This is the info page!</Text>
            <div>
              <Link onClick={navigateToHome}>Go back to home</Link>
            </div>
          </AlphaCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
