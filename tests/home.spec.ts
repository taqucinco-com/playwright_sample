import { test, expect } from "@playwright/test";

test("トップページのタイトルと見出しが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("playwright_sample");
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
});

test("トップページから about へ遷移できる", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

  await page.getByRole("button", { name: "about へ" }).click();

  await expect(page).toHaveURL("/about");
  await expect(page.getByRole("heading", { name: "hoge" })).toBeVisible();
});

test("about からブラウザバックで Home に戻れる", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "about へ" }).click();
  await expect(page).toHaveURL("/about");

  await page.goBack();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
});
