import { test, expect, type Page } from "@playwright/test";
async function login(page: Page, role: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(role + "@orbit.demo");
  await page.getByLabel("Password", { exact: true }).fill("Demo123!");
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Good to see you",
  );
}
async function logout(page: Page) {
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/login/);
}
test("manager creates → employee updates → manager confirms", async ({
  page,
}) => {
  const title = "Release handoff " + Date.now();
  await login(page, "manager");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Task title").fill(title);
  await dialog
    .getByLabel("Description")
    .fill("Verify the full handoff between roles.");
  await dialog.getByLabel("Assign to").selectOption("user-5");
  await dialog
    .getByRole("button", { name: "Create task", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await logout(page);
  await login(page, "employee");
  await page.goto("/tasks?search=" + encodeURIComponent(title));
  await page
    .getByRole("link")
    .filter({ has: page.getByText(title, { exact: true }) })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
  await page.getByLabel("Status", { exact: true }).selectOption("IN_PROGRESS");
  await expect(page.getByLabel("Status", { exact: true })).toBeEnabled();
  await page
    .getByLabel("Add a comment")
    .fill("Started the handoff and reviewed the brief.");
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(
    page.getByText("Started the handoff and reviewed the brief.", {
      exact: true,
    }),
  ).toBeVisible();
  await logout(page);
  await login(page, "manager");
  await page.goto("/tasks?search=" + encodeURIComponent(title));
  await expect(page.locator("tbody")).toContainText("In Progress");
});
test("admin themes, employee editing, filters, notification read state", async ({
  page,
}) => {
  await login(page, "admin");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.goto("/employees?search=Noah");
  await page
    .getByRole("button", { name: "Edit Noah Williams", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Job title")
    .fill("Senior product designer");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByLabel("Search people...").fill("Noah");
  await expect(page).toHaveURL(/search=Noah/);
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.goto("/notifications");
  await expect(page.locator(".notification-row").first()).toBeVisible();
  const read = page.getByRole("button", { name: "Mark all as read" });
  if (await read.isEnabled()) await read.click();
  await expect(
    page.getByRole("button", { name: "Unread (0)", exact: true }),
  ).toBeVisible();
});
test("demo API enforces scoped access and pagination", async ({ page }) => {
  await login(page, "employee");
  expect((await page.request.get("/api/v1/employees")).status()).toBe(403);
  expect((await page.request.get("/api/v1/audit-logs")).status()).toBe(403);
  const response = await page.request.get("/api/v1/tasks?limit=1");
  const data = await response.json();
  expect(data.items).toHaveLength(1);
  expect(data.items[0].assigneeId).toBe("user-5");
  await page.goto("/audit-logs");
  await expect(
    page.getByRole("heading", { name: "This space needs another role" }),
  ).toBeVisible();
});
test("mobile navigation and desktop route smoke checks", async ({ page }) => {
  await login(page, "admin");
  for (const route of ["teams", "board", "reports", "audit-logs", "profile"]) {
    await page.goto("/" + route);
    await expect(page.locator("#main-content h1")).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Task board NEW" }).click();
  await expect(page).toHaveURL(/board/);
  await expect(
    page.getByRole("heading", { name: "A little more flow." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
