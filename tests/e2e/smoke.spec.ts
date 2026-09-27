import { test, expect } from "@playwright/test";

test("smoke test loads login page", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});
