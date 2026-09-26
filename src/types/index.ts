export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";
export const statuses = [
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "IN_REVIEW",
  "COMPLETED",
  "CANCELLED",
] as const;
export type Status = (typeof statuses)[number];
export const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type Priority = (typeof priorities)[number];
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  teamId: string;
  managerId: string;
  joined: string;
  active: boolean;
  avatar: string;
  position: string;
}
export interface Team {
  id: string;
  name: string;
  description: string;
  managerId: string;
  color: string;
}
export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  assigneeId: string;
  creatorId: string;
  teamId: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  updatedAt: string;
}
export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
}
export interface Activity {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  createdAt: string;
}
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  taskId: string;
  read: boolean;
  createdAt: string;
}
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
export type PersonSummary = Pick<Employee, "id" | "name" | "avatar">;
export interface Lookups {
  employees: Pick<Employee, "id" | "name" | "avatar" | "teamId" | "role">[];
  teams: Team[];
  projects: string[];
}
export interface TaskDetail {
  task: Task;
  comments: Comment[];
  activity: Activity[];
  people: PersonSummary[];
}
export interface Dashboard {
  employees: number;
  active: number;
  teams: number;
  tasks: number;
  completed: number;
  overdue: number;
  dueToday: number;
  hours: number;
  status: { name: string; value: number }[];
  priority: { name: string; value: number }[];
  trend: { name: string; completed: number; created: number }[];
  workload: { name: string; tasks: number; hours: number }[];
  recent: Task[];
  activity: Activity[];
}
