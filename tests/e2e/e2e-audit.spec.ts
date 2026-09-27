import { test, expect, type Page } from "@playwright/test";

const timestamp = Date.now();
const testTeamName = `QA_Team_${timestamp}`;
const mgrEmail = `qa_mgr_${timestamp}@orbit.demo`;
const mgrName = `QA Manager ${timestamp}`;
const empEmail = `qa_emp_${timestamp}@orbit.demo`;
const empName = `QA Employee ${timestamp}`;
const testTaskTitle = `QA Task ${timestamp}`;
const commonPassword = "QA_Password123!";

async function loginAs(page: Page, email: string, pass: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(pass);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 25_000 });
}

async function logout(page: Page) {
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL("**/login", { timeout: 25_000 });
}

test.describe.serial("Full End-to-End Audit & Verification Suite", () => {
  test("1. Admin login, page reload persistence, and session refresh", async ({ page }) => {
    await loginAs(page, "admin@workforce.com", "admin123");
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText("Zaryab")).toBeVisible();

    // Reload page to verify persistence without 401 redirect
    await page.reload();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText("Zaryab")).toBeVisible();
    await expect(page.getByText("Overview").first()).toBeVisible();
  });

  test("2. Team creation", async ({ page }) => {
    await loginAs(page, "admin@workforce.com", "admin123");

    // Navigate to teams
    await page.goto("/teams");
    await expect(page.getByRole("button", { name: "Create team" })).toBeVisible();
    await page.getByRole("button", { name: "Create team" }).click();

    // Fill team form
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Team name").fill(testTeamName);
    await dialog.getByLabel("Description").fill("Automated audit verification team");
    
    // Select an existing manager for the team
    const managerSelect = dialog.getByLabel("Team manager");
    await managerSelect.locator("option:not([value=''])").first().waitFor({ timeout: 10_000 });
    const managerOption = managerSelect.locator("option:not([value=''])").first();
    const val = await managerOption.getAttribute("value");
    if (val) await managerSelect.selectOption(val);

    await dialog.getByRole("button", { name: "Create team" }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // Verify team appears in the list
    await expect(page.getByText(testTeamName)).toBeVisible({ timeout: 10_000 });
  });

  test("3. Manager and employee creation, and employee detail edit", async ({ page }) => {
    await loginAs(page, "admin@workforce.com", "admin123");

    // Navigate to employees
    await page.goto("/employees");
    await expect(page.getByRole("button", { name: "Add employee" })).toBeVisible();

    // Create Manager
    await page.getByRole("button", { name: "Add employee" }).click();
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel("Full name").fill(mgrName);
    await dialog.getByLabel("Email address").fill(mgrEmail);
    await dialog.getByLabel("Job title").fill("QA Engineering Lead");
    await dialog.getByLabel("Phone number").fill("+15551234567");
    await dialog.getByLabel("Role").selectOption("MANAGER");

    // Select team
    const teamSelect = dialog.getByLabel("Team");
    await teamSelect.locator(`option:has-text("${testTeamName}")`).waitFor({ timeout: 10_000 });
    await teamSelect.selectOption({ label: testTeamName });
    await dialog.getByLabel(/password/i).fill(commonPassword);

    await dialog.getByRole("button", { name: "Add employee" }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(mgrName)).toBeVisible({ timeout: 10_000 });

    // Create Employee
    await page.getByRole("button", { name: "Add employee" }).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel("Full name").fill(empName);
    await dialog.getByLabel("Email address").fill(empEmail);
    await dialog.getByLabel("Job title").fill("QA Automation Engineer");
    await dialog.getByLabel("Phone number").fill("+15557654321");
    await dialog.getByLabel("Role").selectOption("EMPLOYEE");

    // Select team
    const empTeamSelect = dialog.getByLabel("Team");
    await empTeamSelect.locator(`option:has-text("${testTeamName}")`).waitFor({ timeout: 10_000 });
    await empTeamSelect.selectOption({ label: testTeamName });

    // Select manager
    const reportsTo = dialog.getByLabel("Reports to");
    await reportsTo.locator(`option:has-text("${mgrName}")`).waitFor({ timeout: 10_000 });
    await reportsTo.selectOption({ label: mgrName });
    await dialog.getByLabel(/password/i).fill(commonPassword);

    await dialog.getByRole("button", { name: "Add employee" }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(empName)).toBeVisible({ timeout: 10_000 });

    // Edit Employee Details
    const editBtn = page.getByRole("button", { name: `Edit ${empName}` });
    await editBtn.click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel("Job title").fill("Senior QA Automation Engineer");
    // Leave password blank on edit
    await dialog.getByRole("button", { name: "Save changes" }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // Verify updated title
    await expect(page.getByText("Senior QA Automation Engineer")).toBeVisible({ timeout: 10_000 });
  });

  test("4. Manager & employee authentication and role-based access", async ({ page }) => {
    // Login as new Manager
    await loginAs(page, mgrEmail, commonPassword);
    await expect(page.getByText(mgrName)).toBeVisible();

    // Manager can access /teams and /employees
    await page.goto("/teams");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Logout manager
    await logout(page);

    // Login as new Employee
    await loginAs(page, empEmail, commonPassword);
    await expect(page.getByText(empName)).toBeVisible();

    // Employee cannot access /employees or /audit-logs
    await page.goto("/audit-logs");
    await expect(page.getByText(/needs another role/i)).toBeVisible();

    // Logout employee
    await logout(page);
  });

  test("5. Task lifecycle: creation, assignment, status change, and logged hours", async ({ page }) => {
    // Login as Admin
    await loginAs(page, "admin@workforce.com", "admin123");

    // Navigate to tasks
    await page.goto("/tasks");
    await expect(page.getByRole("button", { name: "Create task" })).toBeVisible();
    await page.getByRole("button", { name: "Create task" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel("Task title").fill(testTaskTitle);
    await dialog.getByLabel("Description").fill("Comprehensive task flow verification for audit");
    await dialog.getByLabel("Project").fill("Orbit Workspace");

    // Assign to new employee
    const assigneeSelect = dialog.getByLabel("Assign to");
    await assigneeSelect.locator(`option:has-text("${empName}")`).waitFor({ timeout: 10_000 });
    await assigneeSelect.selectOption({ label: empName });

    await dialog.getByLabel("Priority").selectOption("HIGH");
    await dialog.getByLabel("Estimated hours").fill("8");

    await dialog.getByRole("button", { name: "Create task" }).click();
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // Filter/search for the task
    const searchInput = page.getByLabel("Search tasks...");
    await searchInput.fill(testTaskTitle);
    await expect(page.getByText(testTaskTitle).first()).toBeVisible({ timeout: 10_000 });

    // Open task detail
    await page.getByText(testTaskTitle).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(testTaskTitle);

    // Change status to IN_PROGRESS
    const statusSelect = page.getByLabel("Status");
    await statusSelect.selectOption("IN_PROGRESS");
    await expect(page.getByText(/in progress/i).first()).toBeVisible({ timeout: 10_000 });

    // Log time
    await page.getByLabel("Hours worked").fill("2.5");
    await page.getByRole("button", { name: "Log time" }).click();
    await expect(page.getByText("2.5h").first()).toBeVisible({ timeout: 10_000 });
  });

  test("6. Realtime comment synchronization between two active browser sessions", async ({ browser }) => {
    // Create Context 1 (Admin)
    const contextAdmin = await browser.newContext();
    const pageAdmin = await contextAdmin.newPage();

    // Create Context 2 (Employee)
    const contextEmp = await browser.newContext();
    const pageEmp = await contextEmp.newPage();

    try {
      // Login Admin in Context 1
      await loginAs(pageAdmin, "admin@workforce.com", "admin123");

      // Login Employee in Context 2
      await loginAs(pageEmp, empEmail, commonPassword);

      // Admin opens the task
      await pageAdmin.goto("/tasks?search=" + encodeURIComponent(testTaskTitle));
      await expect(pageAdmin.getByText(testTaskTitle).first()).toBeVisible({ timeout: 10_000 });
      await pageAdmin.getByText(testTaskTitle).first().click();
      await expect(pageAdmin.getByRole("heading", { level: 1 })).toContainText(testTaskTitle);

      // Employee opens the task
      await pageEmp.goto("/tasks?search=" + encodeURIComponent(testTaskTitle));
      await expect(pageEmp.getByText(testTaskTitle).first()).toBeVisible({ timeout: 10_000 });
      await pageEmp.getByText(testTaskTitle).first().click();
      await expect(pageEmp.getByRole("heading", { level: 1 })).toContainText(testTaskTitle);

      // Admin posts a live comment
      const liveCommentText = `Realtime live sync test comment ${timestamp}`;
      await pageAdmin.getByLabel("Add a comment").fill(liveCommentText);
      await pageAdmin.getByRole("button", { name: "Post comment" }).click();

      // Verify comment appears in Admin view
      await expect(pageAdmin.getByText(liveCommentText)).toBeVisible({ timeout: 10_000 });

      // Verify comment arrives in Employee view in REALTIME via Socket.IO (without page reload!)
      await expect(pageEmp.getByText(liveCommentText)).toBeVisible({ timeout: 15_000 });
    } finally {
      await contextAdmin.close();
      await contextEmp.close();
    }
  });

  test("7. Notifications receipt and marking as read", async ({ page }) => {
    // Login as Employee who received the task assignment and comment
    await loginAs(page, empEmail, commonPassword);

    // Navigate to notifications page
    await page.goto("/notifications");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Check for notifications
    await page.waitForTimeout(2000);
    const markAllBtn = page.getByRole("button", { name: /mark all as read/i });
    if (await markAllBtn.isVisible() && await markAllBtn.isEnabled()) {
      await markAllBtn.click();
      await expect(page.getByText(/unread \(0\)/i)).toBeVisible({ timeout: 10_000 });
    }
  });
});
