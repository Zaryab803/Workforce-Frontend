# Product Requirements Document — Frontend

## 1. Project Overview

**Product:** Workforce & Task Management Platform
**Frontend Framework:** Next.js
**Language:** TypeScript
**UI:** Tailwind CSS + shadcn/ui
**API:** Express.js REST API
**Database:** Supabase PostgreSQL through the backend API

The frontend will provide a modern, responsive, role-based interface for administrators, managers, and employees.

The frontend must not directly manage protected Supabase database tables. All business operations will go through the Express REST API.

```text
Browser
   ↓
Next.js + TypeScript
   ↓
Express REST API
   ↓
Supabase PostgreSQL

```

The application must support the three company-defined roles: Admin, Manager, and Employee.

---

# 2. Frontend Goals

The frontend must provide:

- Secure login experience
- Role-aware dashboards
- Employee management
- Team management
- Task management
- Kanban task board
- Task comments
- Notifications
- Activity/audit log interface
- Search/filtering/sorting
- Server-side pagination
- Loading/error/empty states
- Responsive design
- Clean reusable architecture

The frontend is responsible for user experience and presentation.

It is **not responsible for final authorization decisions**. The backend must verify every protected operation.

---

# 3. Technology Stack

| AreaTechnology |                    |
| -------------- | ------------------ |
| Framework      | Next.js App Router |
| Language       | TypeScript         |
| UI             | React              |
| Styling        | Tailwind CSS       |
| Components     | shadcn/ui          |
| Icons          | Lucide React       |
| API State      | TanStack Query     |
| Forms          | React Hook Form    |
| Validation     | Zod                |
| Local UI State | Zustand            |
| Tables         | TanStack Table     |
| Drag & Drop    | dnd-kit            |
| Charts         | Recharts           |
| Notifications  | Sonner / toast     |
| E2E Testing    | Playwright         |
| Unit Testing   | Vitest             |

Zustand should only be used for client/UI state such as sidebar state, filters, auth UI state, theme, or temporary task-board state.

Server data such as employees, tasks and teams should primarily use **TanStack Query**.

---

# 4. User Roles

## Admin

Admin frontend access includes:

- Dashboard
- Employees
- Teams
- Tasks
- Task Board
- Reports
- Notifications
- Audit Logs
- User/role management

## Manager

Manager frontend access includes:

- Team dashboard
- Team members
- Tasks
- Task Board
- Comments
- Notifications
- Team workload

A manager should only see/manage permitted team data.

## Employee

Employee frontend access includes:

- Personal dashboard
- My Tasks
- Task Board
- Task details
- Comments
- Work/activity logging
- Notifications

---

# 5. Application Routes

```text
/
├── /login
│
├── /dashboard
│
├── /employees
│   └── /employees/[id]
│
├── /teams
│   └── /teams/[id]
│
├── /tasks
│   └── /tasks/[id]
│
├── /board
│
├── /notifications
│
├── /reports
│
├── /audit-logs
│
└── /profile

```

Unauthorized routes must be protected using authentication state and role-aware navigation.

Frontend route protection is for UX only. Backend authorization remains mandatory.

---

# 6. Authentication UI

## Login Page

Fields:

```text
Email
Password
Remember me
Login button

```

Requirements:

- React Hook Form
- Zod validation
- Loading state
- Invalid credential handling
- Password visibility toggle
- Redirect after successful login
- Role-based dashboard redirect

Recommended authentication flow:

```text
Login form
   ↓
POST /api/v1/auth/login
   ↓
Backend verifies credentials
   ↓
Access token returned
+
Refresh token stored securely
   ↓
GET /api/v1/auth/me
   ↓
User loaded

```

Avoid storing long-lived refresh tokens in `localStorage`.

Prefer secure HttpOnly cookies for refresh sessions.

---

# 7. Main Application Layout

The authenticated application should use:

```text
DashboardLayout
├── Sidebar
├── Topbar
├── Breadcrumb
├── Main Content
└── Notification Area

```

Sidebar items should change based on user role.

Example:

```text
ADMIN
Dashboard
Employees
Teams
Tasks
Task Board
Reports
Audit Logs

MANAGER
Dashboard
Team
Tasks
Task Board
Notifications

EMPLOYEE
Dashboard
My Tasks
Task Board
Notifications
Profile

```

---

# 8. Dashboard Module

The original requirements define different dashboard metrics for each role.

## Admin Dashboard

Display:

- Total employees
- Active employees
- Teams
- Total tasks
- Completed tasks
- Overdue tasks
- Tasks by status
- Tasks by priority

Suggested UI:

```text
Metric Cards

Employees | Active | Teams | Tasks

Charts

Tasks by Status
Tasks by Priority
Completion Trend

Recent Activity

```

## Manager Dashboard

Display:

- Team members
- Assigned tasks
- Completed tasks
- Overdue tasks
- Workload distribution
- Team productivity

## Employee Dashboard

Display:

- My tasks
- Tasks due today
- Overdue tasks
- Completed tasks
- Current workload

Charts should only be added where they provide useful information.

---

# 9. Employee Management

## Employee List

Admin should have access to:

- Employee table
- Search
- Role filter
- Team filter
- Employment status filter
- Sorting
- Pagination

Example columns:

| ColumnDescription |                        |
| ----------------- | ---------------------- |
| Employee          | Avatar + name          |
| Email             | Employee email         |
| Team              | Assigned team          |
| Role              | Admin/Manager/Employee |
| Manager           | Reporting manager      |
| Status            | Active/Inactive        |
| Joined            | Joining date           |
| Actions           | View/Edit              |

All pagination/filtering must be performed through the API.

Do not download every employee and filter them inside the browser, consistent with the assignment's server-side pagination requirement.

---

# 10. Employee Details

Route:

```text
/employees/[id]

```

Display:

- Avatar
- Employee ID
- Name
- Email
- Phone
- Team
- Role
- Manager
- Joining date
- Employment status
- Assigned tasks
- Recent activity

Admin can edit employee information.

---

# 11. Create/Edit Employee

Use a reusable:

```text
EmployeeForm

```

Fields:

```text
Name
Email
Phone
Password
Role
Team
Manager
Joining Date
Employment Status
Avatar

```

Validation should run with React Hook Form + Zod before submission.

Backend validation must still run independently.

---

# 12. Team Management

Team page:

```text
/teams

```

Show:

- Team name
- Manager
- Member count
- Active tasks
- Workload

Admin can:

- Create team
- Edit team
- Add members
- Remove members
- Assign manager

Manager can access only permitted team information.

---

# 13. Task Management

The company task model requires title, description, project, assignee, creator, priority, status, dates and work-hour information.

Task properties:

```text
Title
Description
Project
Assignee
Created By
Priority
Status
Due Date
Estimated Hours
Actual Hours
Created Date
Updated Date

```

Statuses:

```text
TODO
IN_PROGRESS
BLOCKED
IN_REVIEW
COMPLETED
CANCELLED

```

Priorities:

```text
LOW
MEDIUM
HIGH
URGENT

```

---

# 14. Task List

Route:

```text
/tasks

```

Features:

- Search
- Status filter
- Priority filter
- Assignee filter
- Team filter
- Project filter
- Due-date filter
- Sorting
- Pagination

Example:

```text
GET /api/v1/tasks?page=1
&limit=20
&status=IN_PROGRESS
&priority=HIGH
&search=customer
&sortBy=dueDate
&sortOrder=asc

```

Filters should update query parameters so views can be bookmarked or shared.

---

# 15. Task Creation

Reusable component:

```text
TaskForm

```

Fields:

```text
Title
Description
Project
Assignee
Priority
Due Date
Estimated Hours

```

Admin and Manager can create tasks according to permissions.

Successful creation should:

1. Close modal/page.
2. Show success notification.
3. Invalidate task queries.
4. Refresh dashboard information if needed.

---

# 16. Kanban Task Board

Route:

```text
/board

```

The assignment requires a Kanban-style workflow and recommends dnd-kit.

Board:

```text
TODO
     ↓
IN PROGRESS
     ↓
IN REVIEW
     ↓
COMPLETED

```

Additional statuses such as BLOCKED and CANCELLED can appear in separate filters or columns.

Use:

```text
@dnd-kit/core
@dnd-kit/sortable

```

When a card moves:

```text
User drags card
     ↓
Optimistic UI
     ↓
PATCH task status API
     ↓
Success → keep update
Failure → rollback

```

The backend decides whether the transition is allowed.

---

# 17. Task Details

Route:

```text
/tasks/[id]

```

Display:

- Task title
- Description
- Status
- Priority
- Assignee
- Creator
- Project
- Due date
- Estimated hours
- Actual hours
- Comments
- Status history
- Activity timeline

---

# 18. Task Comments

Users should be able to:

- View comments
- Add comment
- See author
- See timestamp

Component structure:

```text
TaskComments
├── CommentList
├── CommentItem
└── AddCommentForm

```

---

# 19. Notifications

Route:

```text
/notifications

```

Notification examples:

```text
You were assigned a new task.

"Customer Portal" is due tomorrow.

"API Integration" was moved to IN_REVIEW.

```

UI functionality:

- Notification dropdown
- Notification page
- Unread counter
- Mark one as read
- Mark all as read

Optional future functionality:

- Socket.IO real-time notification updates

---

# 20. Audit Log

Admin only.

Route:

```text
/audit-logs

```

Table fields:

```text
Actor
Action
Entity
Entity ID
Description
Timestamp

```

Filters:

- User
- Action
- Entity
- Date

The UI must not provide edit/delete functionality for audit events.

---

# 21. API Client Architecture

Recommended:

```text
src/lib/api/
├── client.ts
├── auth.api.ts
├── users.api.ts
├── teams.api.ts
├── tasks.api.ts
├── comments.api.ts
├── dashboard.api.ts
├── notifications.api.ts
└── audit.api.ts

```

Example service flow:

```text
Component
   ↓
Custom Query Hook
   ↓
API Service
   ↓
Express API

```

Do not place API calls directly throughout UI components.

---

# 22. TanStack Query Strategy

Example query keys:

```text
["current-user"]

["employees", filters]

["teams"]

["tasks", filters]

["task", taskId]

["dashboard"]

["notifications"]

```

After task creation:

```text
invalidateQueries(["tasks"])
invalidateQueries(["dashboard"])

```

This keeps server state separate from client UI state.

---

# 23. Zustand Usage

Recommended only for global UI state.

Example:

```text
useAppStore
├── sidebarOpen
├── theme
├── taskView
└── selectedFilters

```

Do not duplicate API responses into Zustand unless a specific requirement justifies it.

---

# 24. Component Architecture

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── teams/
│   │   ├── tasks/
│   │   ├── board/
│   │   ├── notifications/
│   │   └── audit-logs/
│   │
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── common/
│
├── features/
│   ├── auth/
│   ├── employees/
│   ├── teams/
│   ├── tasks/
│   ├── dashboard/
│   ├── notifications/
│   └── audit/
│
├── hooks/
├── lib/
│   ├── api/
│   ├── query/
│   └── utils/
│
├── store/
├── types/
└── schemas/

```

Feature-specific components should remain inside their corresponding feature directory.

---

# 25. Error Handling

API errors should display user-friendly messages.

Example backend response:

```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task was not found."
  }
}

```

Frontend should map responses into:

```text
401 → Authentication flow
403 → Permission message
404 → Not found
409 → Conflict
422/400 → Validation messages
500 → Generic error page/toast

```

---

# 26. Loading States

Provide:

- Skeleton loaders
- Button loading states
- Table skeletons
- Dashboard card skeletons
- Task board skeleton
- Route loading UI

Avoid blank pages while waiting for API requests.

---

# 27. Empty States

Examples:

```text
No employees found.

No tasks match these filters.

You don't have any assigned tasks.

No notifications yet.

```

Each empty state should provide a useful action where appropriate.

---

# 28. Responsive Design

Target:

```text
Desktop
Laptop
Tablet
Mobile

```

Desktop should provide the full management experience.

Mobile should support core employee workflows such as:

- Dashboard
- View tasks
- Update task status
- Add comments
- Notifications

---

# 29. Accessibility

Requirements:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Accessible form labels
- ARIA support where necessary
- Sufficient contrast
- Accessible dialogs
- Accessible drag/drop alternatives where practical

---

# 30. Testing

## Unit/Component

Test:

- Form validation
- Role-aware rendering
- Utility functions
- Task status UI

## E2E

Playwright should test the complete flow required by the assignment.

```text
Manager Login
→ Dashboard
→ Create Task
→ Assign Employee
→ Logout

Employee Login
→ View Assigned Task
→ Change Status

Manager Login
→ Confirm New Status

```

---

# 31. Frontend Performance

Required decisions:

1. Server-side pagination instead of loading all records.
2. TanStack Query caching and invalidation.
3. Lazy-load heavy charts/dialogs when appropriate.
4. Debounce search inputs.
5. Use Next.js image optimization for avatars.
6. Avoid unnecessary Zustand/global state.
7. Keep API responses scoped to each page.

---

# 32. Frontend Definition of Done

Frontend is considered complete when:

- Authentication flow works
- Role-aware layout works
- All three dashboards work
- Employee management works
- Team management works
- Task list works
- Task create/edit flow works
- Kanban drag/drop works
- Comments work
- Notifications work
- Audit logs work for Admin
- Search/filter/sort/pagination work
- Loading/error/empty states exist
- Protected routes work
- Responsive layouts work
- Playwright workflow passes
- Production build succeeds