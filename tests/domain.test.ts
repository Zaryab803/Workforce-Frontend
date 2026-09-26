import { describe, it, expect } from "vitest";
import { loginSchema, taskSchema, employeeSchema } from "@/schemas";
import { routeAllowed, overdue, today } from "@/lib/utils";
describe("input validation", () => {
  it("rejects invalid credentials", () => {
    expect(
      loginSchema.safeParse({
        email: "not-email",
        password: "123",
        remember: true,
      }).success,
    ).toBe(false);
  });
  it("requires an assignee and positive estimate", () => {
    expect(
      taskSchema.safeParse({
        title: "New task",
        description: "",
        project: "Orbit",
        assigneeId: "",
        priority: "HIGH",
        dueDate: today(),
        estimatedHours: 0,
      }).success,
    ).toBe(false);
  });
  it("accepts a complete task", () => {
    expect(
      taskSchema.safeParse({
        title: "New task",
        description: "",
        project: "Orbit",
        assigneeId: "user-5",
        priority: "HIGH",
        dueDate: today(),
        estimatedHours: 4,
      }).success,
    ).toBe(true);
  });
  it("allows an unchanged password when editing an employee", () => {
    expect(
      employeeSchema.safeParse({
        name: "Test User",
        email: "test@orbit.demo",
        phone: "+1 555-0100",
        role: "EMPLOYEE",
        teamId: "team-1",
        managerId: "mgr-1",
        joined: "2026-01-01",
        active: true,
        avatar: "",
        position: "Engineer",
        password: "",
      }).success,
    ).toBe(true);
  });
});
describe("role-aware navigation", () => {
  it("keeps audit events and reports admin-only", () => {
    for (const role of ["EMPLOYEE", "MANAGER"]) {
      expect(routeAllowed("/audit-logs", role)).toBe(false);
      expect(routeAllowed("/reports", role)).toBe(false);
    }
    expect(routeAllowed("/reports", "ADMIN")).toBe(true);
  });
  it("keeps employee management hidden from employees", () => {
    expect(routeAllowed("/employees/user-1", "EMPLOYEE")).toBe(false);
    expect(routeAllowed("/tasks/ORB-101", "EMPLOYEE")).toBe(true);
  });
});
describe("due-date handling", () => {
  it("does not mark completed or cancelled work overdue", () => {
    expect(overdue({ dueDate: "2000-01-01", status: "COMPLETED" })).toBe(false);
    expect(overdue({ dueDate: "2000-01-01", status: "CANCELLED" })).toBe(false);
    expect(overdue({ dueDate: "2000-01-01", status: "TODO" })).toBe(true);
    expect(overdue({ dueDate: today(), status: "TODO" })).toBe(false);
  });
});
