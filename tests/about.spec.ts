import { test, expect } from "@playwright/test";

test("about ページに直接アクセスできる", async ({ page }) => {
  const response = await page.goto("/about");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("playwright_sample");
  await expect(page.getByRole("heading", { name: "hoge" })).toBeVisible();
});
