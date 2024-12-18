import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Button,
  Card,
  InlineStack,
  Layout,
  Page,
  Tabs,
  TextField
} from "@shopify/polaris";
import { database } from "app/db.server";
import type { Section } from "app/types";
import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const db = await database;
  await db.read();
  const sections = db.data.sections;
  return { sections };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const input = formData.get("input") as string;
  const section = JSON.parse(input) as Section;
  return section;
};

const defaultSection = (): Section => ({
  id: `${Date.now()}`,
  name: "",
  entities: "",
  screenshot: "",
})
export default function Index() {
  const { sections } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [tabIndex, setTabIndex] = useState(0);

  const [currentSections, setCurrentSections] = useState<Section>(defaultSection());

  const tabs = sections.map((section) => ({
    id: section.id,
    content: section.name,
  }));

  tabs.unshift({ id: "blank", content: "Blank Tab" });

  const handleChange = (selectedTabIndex: number) => {
    setTabIndex(selectedTabIndex);
    if (selectedTabIndex === 0) {
      setCurrentSections(defaultSection());
    } else {
      setCurrentSections(sections[selectedTabIndex]);
    }
  }

  const submit = () => fetcher.submit({
    input: JSON.stringify(currentSections),
  }, { method: "POST" });

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const sectionId = fetcher.data?.id;

  useEffect(() => {
    if (sectionId) {
      const tabIdx = tabs.findIndex((tab) => tab.id === sectionId);
      handleChange(tabIdx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]);

  return (
    <Page>
      <InlineStack align="space-between">
        <Tabs tabs={tabs} selected={tabIndex} onSelect={handleChange} disabled={isLoading} />
        <Button variant="primary" onClick={submit} loading={isLoading}>Save</Button>
      </InlineStack>
      <Layout>
        <Layout.Section>
          <Card>
            <TextField
              label="Entities"
              value={currentSections.entities}
              onChange={(value) => setCurrentSections({ ...currentSections, entities: value })}
              autoComplete="off"
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
