import { z } from "zod";
import { priorities, statuses } from "@/types";
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date")
  .refine((v) => {
    const d = new Date(v);
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, "Invalid date");
export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  remember: z.boolean(),
});
export const taskSchema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(140),
  description: z.string().max(3000),
  project: z.string().trim().min(1, "Project is required").max(100),
  assigneeId: z.string().min(1, "Choose an assignee"),
  priority: z.enum(priorities),
  dueDate: day,
  estimatedHours: z.number().min(0.5).max(1000),
});
export const employeeSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: z.string().max(30),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
  teamId: z.string().min(1, "Choose a team"),
  managerId: z.string(),
  joined: day,
  active: z.boolean(),
  avatar: z
    .string()
    .refine(
      (v) => v === "" || /^https:\/\//.test(v),
      "Use an HTTPS avatar URL",
    ),
  position: z.string().min(2).max(100),
  password: z
    .string()
    .refine((v) => !v || v.length >= 8, "Use at least 8 characters"),
});
export const teamSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().max(500),
  managerId: z.string().min(1, "Choose a manager"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
export const statusSchema = z.object({ status: z.enum(statuses) });
export type TaskInput = z.infer<typeof taskSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type TeamInput = z.infer<typeof teamSchema>;
