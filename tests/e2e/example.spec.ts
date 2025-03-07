import { shopifyTest, expect } from "tests/global/shopify";

shopifyTest("has title", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/app`);

  // Expect a title "to contain" a substring.
  expect(
    page.getByText("Congrats on creating a new Shopify app 🎉"),
  ).toBeTruthy();
});

shopifyTest("clicking on generate button", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/app`);

  await page.click('button span:has-text("Generate a product")');

  const productText = await page.textContent("pre code");

  expect(productText).toContain("Snowboard");

  const viewProductButton = await page.$$(
    'button span:has-text("View product")',
  );

  expect(viewProductButton).toBeDefined();
});
