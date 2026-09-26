# Implementation decisions

## Request flow

React feature → TanStack Query hook → typed service → fetch client → REST API.

The shipped demo API is a Next.js route handler, deliberately separated from the UI. It replaces the Express server only for the downloadable, zero-configuration demo. Set `NEXT_PUBLIC_API_URL` when your Express server is ready. The mock route handlers can then be removed.

## State ownership

- **Server data:** TanStack Query; mutations invalidate affected workspace views. The current demo uses broad invalidation for clear cross-module consistency. Narrow invalidation by query key as the API grows.
- **Filters and pagination:** URL query parameters.
- **Sidebar:** Zustand.
- **Forms:** React Hook Form + Zod.
- **Theme:** next-themes.
- **Temporary dialog/input state:** local React state.
- **Kanban optimistic state:** query-cache snapshot with rollback on failure.

## Access matrix

| Capability                   | Admin               | Manager                     | Employee       |
| ---------------------------- | ------------------- | --------------------------- | -------------- |
| Dashboard                    | Workspace           | Managed teams               | Own tasks      |
| People                       | View/create/edit    | View permitted team members | Hidden         |
| Teams                        | Create/edit/members | View managed teams          | Hidden         |
| Tasks / board                | Workspace tasks     | Managed team tasks          | Assigned tasks |
| Create / edit task details   | Yes                 | Within managed teams        | No             |
| Status, comments, work hours | Accessible tasks    | Accessible tasks            | Assigned tasks |
| Reports / audit              | Yes                 | No                          | No             |
| Notifications                | Own                 | Own                         | Own            |
| Profile / theme              | Own                 | Own                         | Own            |

Navigation restrictions improve UX. Every demo API operation checks the session and permitted scope independently. The real Express backend must implement equivalent checks. A role slug in the UI is never sufficient authorization.

## Session handling

The demo validates a hashed password, generates an opaque UUID, stores a session record, and sets an HttpOnly SameSite=Lax cookie. “Keep me signed in” makes it persistent for seven days; otherwise it is a session cookie with a twelve-hour server-side expiry. Sign-out revokes it. No auth or refresh token is stored in localStorage.

Production requires your own authenticated session and/or access/refresh flow. The fetch adapter currently assumes a cookie-backed API with `credentials: include`. Cross-origin Express requires an explicit trusted frontend origin and credentialed CORS, plus appropriate secure cookie and CSRF configuration. Add refresh retries if your backend uses short-lived access tokens; they are not mocked as production-ready here.

## Data and pagination

The API computes search/filter/sort and returns `{items,total,page,limit,pages}`. Lists retain previous pages while a new page is loading. Search is debounced by 300ms. Dashboard metrics are aggregated on the server. The compact lookup endpoint excludes email, phone, passwords, and session data.

New task assignments and task changes create notifications; task creation/edit/status/comments/time logs and employee/team changes create audit events. Notifications belong to the current user. Audit history is read-only in the frontend.

## Visual system

Semantic CSS variables cover surfaces, text, borders, accent colors, shadows, and status colors in both themes. Motion entrance effects use transforms and opacity; animations honor reduced motion. A self-contained system font stack keeps the demo offline-capable without remote font requests.

## Deliberate limitations

- No Express server or Supabase setup is included; the user requested frontend code and dummy data.
- No production deployment, database migrations, real-time delivery, password-reset service, or invitation emails.
- No drag ordering persisted within a column, because the provided task model has no ordering field. Dragging between columns persists the task status.
- The demo uses a single-process synchronous JSON store. Replace it with transactional backend persistence for production.
- Manager scopes follow `team.managerId`. Employees see assigned tasks. Task ownership remains explicit when team membership changes.
