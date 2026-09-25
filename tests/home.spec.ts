import { test, expect } from "@playwright/test";

test("トップページから about へ遷移できる", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

  await page.getByRole("button", { name: "about へ" }).click();

  await expect(page).toHaveURL("/about");
  await expect(page.getByRole("heading", { name: "hoge" })).toBeVisible();
});
