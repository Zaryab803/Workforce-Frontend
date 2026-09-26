import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const label = (v: string) =>
  v
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
export const initials = (v: string) =>
  v
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
export const date = (v: string) =>
  new Date(v.length === 10 ? v + "T12:00:00" : v).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
export const today = () => new Date().toISOString().slice(0, 10);
export const overdue = (task: { dueDate: string; status: string }) =>
  task.dueDate < today() && !["COMPLETED", "CANCELLED"].includes(task.status);
export const canManage = (role?: string) =>
  role === "ADMIN" || role === "MANAGER";
export function routeAllowed(path: string, role: string) {
  if (path.startsWith("/audit-logs") || path.startsWith("/reports"))
    return role === "ADMIN";
  if (path.startsWith("/employees") || path.startsWith("/teams"))
    return role !== "EMPLOYEE";
  return true;
}
