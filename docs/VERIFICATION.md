# Verification

Checked on September 24, 2026, using Node.js 24 and Chromium.

## Passed

- `npm run typecheck` — strict TypeScript validation.
- `npm run build` — optimized Next.js production build, including all workspace and detail routes.
- `npm test` — 7 tests covering login/task/employee validation, role-aware route access, and overdue-date handling.
- 4 Playwright workflow scenarios, verified against the production server:
  - Manager login → task creation assigned to Noah Williams → sign out → Employee login → status update and comment → sign out → Manager confirmation.
  - Admin theme changes and persistence, employee editing, URL search, and marking all notifications read.
  - API role restrictions and scoped pagination, plus a blocked admin-only route for an Employee.
  - Desktop route checks and mobile sidebar navigation with no document-level horizontal overflow.
- 1 additional Playwright visual/interaction scenario:
  - Light/dark desktop views and mobile rendering.
  - Simulated failed Kanban status request with optimistic rollback verified.
  - No browser page errors in that scenario.

Screenshots are included in `docs/previews/`. Scroll-triggered entrance effects were allowed to finish before the final dashboard captures.

The final workflow run passed all 4 scenarios. The separate visual/rollback scenario passed in the preceding verification run; the final changes corrected accessible form labeling and a browser-test loading-state race.

## Re-run locally

```bash
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The Playwright configuration starts the production server automatically when port 3000 is free. Browser tests create fictional tasks and edit demo records. Stop the server and run `npm run demo:reset` afterward to return to the initial sample data. Screenshots from the visual test are regenerated in `docs/previews/`.

## Scope

Verification covers the bundled local dummy-data API. No external Express backend, Supabase instance, or production authentication provider was connected or tested. The demo database and session files, dependency folders, build output, and temporary test traces are excluded from the ZIP.
