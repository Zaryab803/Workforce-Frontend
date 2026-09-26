# REST adapter contract

Base URL: `/api/v1` in demo mode, or `NEXT_PUBLIC_API_URL` in Express mode. Responses are plain JSON values. Use `credentials: include`. Timestamps are ISO strings and date-only fields use `YYYY-MM-DD`.

Errors use an HTTP status and `{ "error": { "code": "FORBIDDEN", "message": "A helpful explanation." } }`. The client handles authentication failures, permission errors, not-found states, validation/conflict messages, and server errors through error states and toasts.

| Method | Path                  | Result / input                                                             |
| ------ | --------------------- | -------------------------------------------------------------------------- |
| POST   | `/auth/login`         | `{email,password,remember}` → Employee + session cookie                    |
| GET    | `/auth/me`            | Current Employee                                                           |
| POST   | `/auth/logout`        | Revoke session; `{success:true}`                                           |
| GET    | `/lookups`            | `{employees:[{id,name,teamId,role,avatar}],teams,projects}` scoped choices |
| GET    | `/dashboard`          | Dashboard aggregates; see `src/types/index.ts`                             |
| GET    | `/employees`          | Paginated Employees; Admin or Manager                                      |
| POST   | `/employees`          | EmployeeInput → Employee; Admin only                                       |
| GET    | `/employees/:id`      | `{employee,tasks,activity}`                                                |
| PATCH  | `/employees/:id`      | EmployeeInput → Employee; Admin only                                       |
| GET    | `/teams`              | Teams + `members` and `activeTasks` counts                                 |
| POST   | `/teams`              | TeamInput → Team; Admin only                                               |
| GET    | `/teams/:id`          | `{team,members,tasks}`                                                     |
| PATCH  | `/teams/:id`          | TeamInput → Team; Admin only                                               |
| PATCH  | `/teams/:id/members`  | `{userId,remove:boolean}` → Team; Admin only                               |
| GET    | `/tasks`              | Paginated, role-scoped Tasks                                               |
| POST   | `/tasks`              | TaskInput → Task; Admin/Manager                                            |
| GET    | `/tasks/:id`          | `{task,comments,activity,people}`                                          |
| PATCH  | `/tasks/:id`          | TaskInput → Task; Admin/Manager                                            |
| PATCH  | `/tasks/:id/status`   | `{status}` → Task                                                          |
| POST   | `/tasks/:id/comments` | `{body}` → Comment                                                         |
| POST   | `/tasks/:id/hours`    | `{hours}` → Task                                                           |
| GET    | `/notifications`      | Current user’s Notification[]                                              |
| PATCH  | `/notifications/:id`  | Mark one read                                                              |
| PATCH  | `/notifications/all`  | Mark all current-user notices read                                         |
| GET    | `/audit-logs`         | Paginated Activity[]; Admin only                                           |

## List queries

Common: `page` (1-based), `limit` (default 8, maximum 100), `search`, `sortBy`, `sortOrder=asc|desc`.

- Employees: `role`, `teamId`, `active=true|false`; sortable `name`, `email`, `role`, `joined`.
- Tasks: `status`, `priority`, `assigneeId`, `teamId`, `project`, `dueDate`; sortable `title`, `dueDate`, `priority`, `status`, `createdAt`.
- Audit: `actorId`, `action`, `entity`, `date`; sortable `createdAt`, `action`, `entity`.

```json
{ "items": [], "total": 0, "page": 1, "limit": 8, "pages": 1 }
```

Schemas are defined in `src/schemas/index.ts`. Domain response shapes are in `src/types/index.ts`. Passwords are never included in employee responses. Employee creation requires a password; an empty password on edit leaves it unchanged.

## Integration notes

Implement authorization in Express, including field-level restrictions and team scoping. Never trust a submitted `teamId` or a frontend role flag. Derive task team ownership from the permitted assignee. The frontend sends neither protected Supabase queries nor database credentials.

If your backend returns `{success:true,data:...}`, unwrap `data` in `api()` before returning it. If it uses JWT access tokens, add a short-lived in-memory access-token strategy and a secure refresh-cookie flow in the client adapter. Do not store long-lived refresh tokens in localStorage.
