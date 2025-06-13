export default function AdditionalPage() {
  return (
    <>
      <script src="https://cdn.shopify.com/shopifycloud/app-bridge-ui-experimental.js"></script>
      <s-page>
        <ui-title-bar title="Additional page" />
        
        <s-section>
          <s-stack gap="small-300">
            <s-paragraph>
              The app template comes with an additional page which
              demonstrates how to create multiple pages within app navigation
              using{" "}
              <s-link
                href="https://shopify.dev/docs/apps/tools/app-bridge"
                target="_blank"
              >
                App Bridge
              </s-link>
              .
            </s-paragraph>
            <s-paragraph>
              To create your own page and have it show up in the app navigation, add a page inside app/routes, and a link to it in the NavMenu component found in app/routes/app.jsx.
            </s-paragraph>
          </s-stack>
        </s-section>
        
        <s-section slot="aside">
          <s-stack gap="small-200">
            <s-heading>Resources</s-heading>
            <s-unordered-list>
              <s-list-item>
                <s-link
                  href="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
                  target="_blank"
                >
                  App nav best practices
                </s-link>
              </s-list-item>
            </s-unordered-list>
          </s-stack>
        </s-section>
      </s-page>
    </>
  );
}

function Code({ children }) {
  return (
    <s-box
      padding="small-100"
      background="subdued"
      border="base"
      borderRadius="small"
      display="inline"
    >
      <code>{children}</code>
    </s-box>
  );
}
