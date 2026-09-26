# Orbit — Workforce & Task Management

A complete, responsive Next.js + TypeScript frontend demo based on your Workforce & Task Management PRD. Includes Motion animations, light/dark/system themes, role-aware navigation, and working sample-data workflows.

## Start in three steps

Install **Node.js 22 LTS or newer**. Then open a terminal in this extracted project folder:

```bash
npm ci
npm run dev
```

Open **http://localhost:3000**. No Supabase project, Express server, API keys, or environment file is required for the demo.

### Demo accounts

| Role     | Email               | Password |
| -------- | ------------------- | -------- |
| Admin    | admin@orbit.demo    | Demo123! |
| Manager  | manager@orbit.demo  | Demo123! |
| Employee | employee@orbit.demo | Demo123! |

The login screen’s role buttons fill these credentials; click **Sign in** afterward. The employee account is **Noah Williams**, a member of **Sarah Chen’s Product & Design team**. You can also sign in as seeded employees using their displayed email and the same demo password. Newly created employees use the initial password you enter.

## What works

- Admin, Manager, and Employee dashboards, with scoped data and navigation.
- Light, dark, and device themes, persisted in the browser without a flash on load.
- Motion page entrances, spring dialogs, staggered cards, hover feedback, animated charts, navigation highlights, login artwork, and notification transitions. Reduced motion preferences are respected.
- Employee creation/editing, roles, active status, detail pages, search, filters, sorting, and API pagination.
- Teams, manager assignment, team editing, member assignment/removal, and workload views.
- Task creation/editing, details, all six statuses and four priorities, project and assignee selection, due dates, estimates, and actual hours.
- Task filters in the URL: search, status, priority, assignee, team, project, and due date. Column sorting and page navigation also update the URL.
- dnd-kit Kanban with pointer and keyboard dragging, optimistic changes, and rollback on API failure. Open any task to change status using a standard select control.
- Task comments with author and time, work-hour logging, status history, and activity timelines.
- Notification dropdown and inbox, unread counts, mark-one and mark-all-as-read.
- Admin reports with CSV summary export and a read-only audit log with filters.
- Responsive navigation, empty/error/loading states, accessible Radix dialogs, focus styles, and keyboard controls.
- Persistent demo records: refresh, log out, and switch roles without losing changes.

## Suggested walkthrough

1. Sign in as **Manager** and create a task assigned to **Noah Williams**.
2. Sign out and sign in as **Employee**.
3. Find the task in **My tasks**, open it, set its status to **In Progress**, and add a comment.
4. Sign back in as **Manager** and confirm the update.
5. Sign in as **Admin** to explore employee management, teams, reports, and audit logs.
6. Use the moon/sun button or **My profile** to explore both themes.

## Commands

```bash
npm run dev        # Development server
npm run typecheck  # TypeScript validation
npm run build      # Production build
npm run start      # Serve the production build
npm test           # Vitest domain/validation tests
npx playwright install chromium
npm run test:e2e   # Browser workflow tests (run npm run build first)
npm run format    # Format source and documentation
npm run demo:reset # Reset fictional data (stop the server first)
```

Run the app as a normal Node.js server for the file-backed demo. `npm run build` does not turn the app into a static export.

## Project structure

```text
src/
  app/
    (workspace)/         # Protected workspace screens and detail routes
    login/               # Demo sign-in screen
    api/v1/[...path]/     # Local demo REST adapter
    globals.css          # Semantic light/dark tokens and responsive styling
    providers.tsx        # Query, theme, Motion, and toast providers
  components/
    ui/                  # shadcn-style Button and Radix Dialog primitives
    common/              # Tables, fields, avatars, loading states, pagination
    layout/              # App shell, responsive sidebar, topbar, theme toggle
  features/
    auth/ dashboard/ employees/ teams/ tasks/ notifications/ audit/ profile/
  hooks/                 # Query actions, user state, URL filters, debounce
  lib/
    api/                 # Fetch client and typed feature services
    mock/                # Fictional seed data and local demo persistence
    utils.ts
  schemas/               # Shared Zod form/request schemas
  store/                 # Zustand UI state only
  types/                 # Shared domain types
```

TanStack Query owns server data. Zustand owns the mobile-sidebar UI state. next-themes owns color preference. Form state stays in React Hook Form. The UI never connects to Supabase directly.

## Design and customization

- Change semantic colors in `src/app/globals.css` under `:root` and `.dark`.
- Edit dummy employees, teams, and tasks in `src/lib/mock/seed.ts`, then reset the demo database.
- Change the workspace name and logo in `src/components/layout/app-shell.tsx`.
- Tune Motion behavior in the page components; `MotionConfig reducedMotion="user"` is the global accessibility policy.
- Built-in avatars use initials; optional HTTPS avatar URLs use `next/image` in unoptimized mode so a demo can accept arbitrary URLs. Production should use a controlled image host and Next.js remotePatterns.
- The Button uses the shadcn-style CVA/Slot approach, the dialog uses accessible Radix primitives, and `components.json` is included for further shadcn/ui additions. Remaining reusable controls use semantic HTML and Tailwind-compatible CSS tokens.

## Connecting your Express backend

Read **[docs/API-CONTRACT.md](docs/API-CONTRACT.md)** and **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** before integrating.

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Copy `.env.example` to `.env.local`, set the URL, and restart Next.js. Implement the matching API contract in Express and use your backend for all Supabase operations. If your response envelope differs, adapt `src/lib/api/client.ts` and the services.

## Demo boundaries

This is a frontend deliverable with a supporting **local demo API**, not a production authentication or database service. The demo stores fictional records in `.data/demo.json`, uses hashed passwords and an HttpOnly session cookie, and checks role/team scope in its request handlers. It has no refresh-token/access-token integration, real-time sockets, password recovery, email delivery, or production database.

Keep the demo on a trusted local machine. The JSON store is intended for a single Node process; it does not provide cross-process transaction safety. It requires a writable filesystem and is unsuitable for serverless deployment. Use Express + Supabase, real sessions/refresh handling, rate limits, CSRF protections appropriate to your deployment, audit durability, and backend authorization before deploying with real data.

The Kanban board pages through at most 60 scoped tasks at a time; its column counts describe the current filtered page. Employee/task lists filter, sort, and paginate in the demo API, not by downloading the entire dataset into a client store. The demo’s compact lookup endpoint returns scoped option fields; replace it with searchable paged lookups for very large teams.

Task status transitions currently allow all six defined states. Your Express backend should enforce the organization’s transition rules. Team membership changes preserve each existing task’s original team; administrators can reassign those tasks when needed.

Charts are derived from the actual demo records, including recent completion dates. They are intentionally not fabricated analytics. Reports export aggregate metrics; audit events have no edit/delete UI.

See **[docs/VERIFICATION.md](docs/VERIFICATION.md)** for the checks run on this package.
