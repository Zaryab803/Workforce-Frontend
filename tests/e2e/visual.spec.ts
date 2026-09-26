import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
test("capture responsive themes and verify drag rollback", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(
    page.getByText("A little more progress", { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator(".page-footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
  mkdirSync("docs/previews", { recursive: true });
  await page.screenshot({
    path: "docs/previews/dashboard-light.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({
    path: "docs/previews/dashboard-dark.png",
    fullPage: true,
  });
  await page.goto("/board");
  await expect(page.locator(".kanban-card").first()).toBeVisible();
  await page.screenshot({
    path: "docs/previews/board-dark.png",
    fullPage: true,
  });
  const card = page
    .locator(".kanban-column")
    .nth(0)
    .locator(".kanban-card")
    .first();
  const title = (await card.locator(".kanban-title").innerText()).trim();
  const handle = card.locator(".drag-handle");
  const from = await handle.boundingBox();
  const target = await page.locator(".kanban-column").nth(1).boundingBox();
  expect(from).not.toBeNull();
  expect(target).not.toBeNull();
  await page.route("**/api/v1/tasks/*/status", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "Simulated rollback check" } }),
    }),
  );
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  await page.mouse.down();
  await page.mouse.move(from!.x + 20, from!.y + 20, { steps: 4 });
  await page.mouse.move(target!.x + target!.width / 2, target!.y + 90, {
    steps: 12,
  });
  await page.mouse.up();
  await expect(
    page.getByText("Simulated rollback check", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".kanban-column").nth(0)).toContainText(title);
  await page.unroute("**/api/v1/tasks/*/status");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: "docs/previews/dashboard-mobile.png",
    fullPage: false,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
