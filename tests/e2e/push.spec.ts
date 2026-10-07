import { test, expect } from "@playwright/test";

const appId = "edd7b5b3-0d24-4927-9025-d360f655514e";
const employee = {
  id: "test-employee",
  name: "Push Test Employee",
  role: "EMPLOYEE",
  email: "push-test@example.test",
  teamIds: [],
  active: true,
};

async function mockSession(
  page: import("@playwright/test").Page,
  denied = false,
  notices: Array<Record<string, unknown>> = [],
) {
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/auth/refresh")
      ? { accessToken: "isolated-push-test-token" }
      : path.endsWith("/auth/me")
        ? employee
        : path.endsWith("/notifications/push-config")
          ? {
              enabled: true,
              appId,
              externalId: "opaque-test-employee",
              preference: false,
            }
          : path.endsWith("/notifications/push-preference")
            ? {
                enabled: JSON.parse(route.request().postData() || "{}").enabled,
              }
            : path.endsWith("/lookups")
              ? { employees: [], teams: [], projects: [] }
              : path.endsWith("/tasks")
                ? { items: [], total: 0, page: 1, limit: 20, pages: 1 }
                : path.endsWith("/notifications")
                  ? notices
                  : {};
    await route.fulfill({ json: { success: true, data } });
  });
  await page.route(
    "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js",
    async (route) => {
      await route.fulfill({
        contentType: "application/javascript",
        body: `
      window.pushTestCalls = [];
      const callbacks = {};
      const subscription = { optedIn: false, optIn: async () => { subscription.optedIn = true; window.pushTestCalls.push("optIn"); }, optOut: async () => { subscription.optedIn = false; window.pushTestCalls.push("optOut"); }, addEventListener: () => {} };
      const sdk = {
        init: async options => { window.pushTestCalls.push("init"); window.pushTestOptions = options; },
        login: async id => { window.pushTestCalls.push("login:" + id); },
        logout: async () => { window.pushTestCalls.push("logout"); },
        User: { PushSubscription: subscription },
        Notifications: { permission: false, permissionNative: "default", addEventListener: (event, fn) => { callbacks[event] = fn; }, requestPermission: async () => { window.pushTestCalls.push("permission"); sdk.Notifications.permission = ${!denied}; sdk.Notifications.permissionNative = ${JSON.stringify(denied ? "denied" : "granted")}; callbacks.permissionChange?.(); } }
      };
      for (const callback of window.OneSignalDeferred || []) callback(sdk);
    `,
      });
    },
  );
}

test("SDK initializes once; enabling, disabling and navigation preserve the existing notification page", async ({
  page,
  request,
}) => {
  const worker = await request.get("/onesignal/OneSignalSDKWorker.js", {
    maxRedirects: 0,
  });
  expect(worker.status()).toBe(200);
  expect(worker.headers()["content-type"]).toMatch(/javascript/);
  expect(await worker.text()).toContain("OneSignalSDK.sw.js");
  await mockSession(page);
  await page.goto("/notifications");
  const enable = page.getByRole("button", {
    name: "Enable push notifications",
  });
  await expect(enable).toBeEnabled();
  expect(
    await page.evaluate(() => (window as any).pushTestCalls),
  ).not.toContain("permission");
  await enable.click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Push notifications are enabled." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Disable push notifications" })
    .click();
  await expect(enable).toBeEnabled();
  const calls = await page.evaluate(
    () => (window as any).pushTestCalls as string[],
  );
  expect(calls.filter((call) => call === "init")).toHaveLength(1);
  expect(calls).toContain("login:opaque-test-employee");
  expect(calls.filter((call) => call === "permission")).toHaveLength(1);
  const options = await page.evaluate(() => (window as any).pushTestOptions);
  expect(options.serviceWorkerParam.scope).toBe("/onesignal/");
  expect(options.promptOptions.slidedown.prompts[0].autoPrompt).toBe(false);
  await page
    .getByRole("link", { name: "My tasks", exact: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: "Notifications", exact: true })
    .first()
    .click();
  expect(
    await page.evaluate(
      () =>
        (window as any).pushTestCalls.filter((call: string) => call === "init")
          .length,
    ),
  ).toBe(1);
});

test("denied native permission explains recovery and does not subscribe", async ({
  page,
}) => {
  await mockSession(page, true);
  await page.goto("/notifications");
  const enable = page.getByRole("button", {
    name: "Enable push notifications",
  });
  await expect(enable).toBeEnabled();
  await enable.click();
  await expect(
    page.getByRole("status").filter({ hasText: "Notifications are blocked." }),
  ).toBeVisible();
  await expect(enable).toBeDisabled();
  expect(
    await page.evaluate(() => (window as any).pushTestCalls),
  ).not.toContain("optIn");
});

test("login success appears in-app and never links a user ID to a task", async ({
  page,
}) => {
  await mockSession(page, false, [
    {
      id: "login-notice",
      userId: employee.id,
      title: "Login successful",
      body: "You have signed in successfully.",
      taskId: "",
      read: false,
      createdAt: "2026-10-06T12:00:00Z",
    },
  ]);
  await page.goto("/notifications");
  const notice = page.locator(".notification-row");
  await expect(
    notice.getByText("Login successful", { exact: true }),
  ).toBeVisible();
  await expect(
    notice.getByText("You have signed in successfully.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View notification task" }),
  ).toHaveCount(0);
});
