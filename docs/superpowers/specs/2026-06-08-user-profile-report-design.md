# User Profile Report — Design

**Status:** Approved
**Issue:** [String-sg/onward#571](https://github.com/String-sg/onward/issues/571) — Expose subscriber list and content preference on Glow admin
**Depends on / Related:** [Streaming Report Exports](./2026-06-08-streaming-report-exports-design.md) (Spec A) and [Card-Grid Report Index](./2026-06-10-card-grid-report-index-design.md) (Spec C). This is Spec B; it reuses the `generateReport` helper, the `sanitizeSpreadsheetCell` sanitizer, and the already-nested `download/quiz` route that Spec A introduces, and it plugs a new report into the card-grid reports area that Spec C restructures. Spec A and Spec C land first.

**Naming:** the route/folder/endpoint segment is `user-profile` (matching the `UserProfile` model); the user-facing label, sheet name, and filename use "User Profile Report" per #571.

## Overview

Add a "User Profile Report" as a new report in the admin **Generate Report** area, alongside the existing "Quiz Report". The area's card-grid index, shared layout, and "← Back to reports" pattern are owned by Spec C; this spec is purely additive — it adds the `user-profile` sibling page route (`/admin/reports/user-profile`), a card entry in the index, and the user-profile download endpoint. The page previews its rows with server-side pagination, carries a "← Back to reports" link per Spec C's pattern, and offers an `.xlsx` download. The user-profile download streams all onboarded users (no filter) via Spec A's `generateReport` helper.

Scope: this report reuses Spec A's export mechanism unchanged (no new streaming path) and Spec C's reports-area structure unchanged (no presentation/routing decisions of its own).

## Goals

- **Goal:** an admin can view and download the onboarded-user list with each user's content preferences and subscription status.
- **Goal:** reuse Spec A's streaming export and sanitizer — no second export mechanism.

## Requirements (from #571)

Table format, one row per onboarded user:

| Column              | Source                                     | Format                      |
| ------------------- | ------------------------------------------ | --------------------------- |
| Name                | `UserProfile.user.name`                    | text                        |
| Email               | `UserProfile.user.email`                   | text                        |
| Content Preferences | `UserProfile.interests[].collection.title` | topic titles joined by `, ` |
| Subscribed?         | `UserProfile.isSubscribed`                 | `Yes` / `No`                |

Out of scope: learning frequency, onboarded date (explicitly excluded — not in the issue).

## Data model

A user is "onboarded" once a `UserProfile` row exists. Relevant Prisma models (`prisma/schema.prisma`):

- `UserProfile` — `userId`, `isSubscribed`, relation `user` (→ `User.name`, `User.email`), relation `interests` (→ `UserInterest[]`).
- `UserInterest` — composite key `(userId, collectionId)`, relation `collection` (→ `Collection.title`).

Generated types `UserProfileFindManyArgs` / `UserProfileGetPayload` are re-exported from `$lib/server/db.js`, matching the pattern the quiz report uses with `LearningJourney*`.

## Architecture

> Decision: nested per-report download endpoints (see [ADR-0003](../../decisions/0003-report-export-routing-and-page-routes.md)). The reports-area presentation (card-grid index with per-page back navigation, see [ADR-0004](../../decisions/0004-card-grid-report-index.md)) is owned by [Spec C](./2026-06-10-card-grid-report-index-design.md); this spec consumes that structure unchanged.

**Downloads (API tree).** Spec A already moved the quiz download to `src/routes/admin/api/download/quiz/+server.ts`. This spec adds the sibling `src/routes/admin/api/download/user-profile/+server.ts`, keeping each handler single-purpose and the `download/{quiz,user-profile}` hierarchy a clear "report exports" family. Downloads stream a file and are API endpoints, so they stay in the `admin/api` tree, separate from the page routes.

**Pages (route tree).** Spec C restructures `src/routes/admin/(protected)/reports/` into a card-grid index (`reports/+page.svelte`), a slim shared `+layout.svelte`, and a relocated `reports/quiz/` sibling. This spec adds one more sibling, `reports/user-profile/` (new), and one card entry to the index's report list. The user-profile page renders a "← Back to reports" link above its content per Spec C's pattern. Its load runs only its own queries, so server-side pagination works without a discriminated-union page payload or tab branching.

## Contracts & boundaries

This spec introduces no new reusable contract; it **consumes** Spec A's boundaries:

- `generateReport(options)` — owns streaming, response headers, `Cache-Control: no-store`, per-cell `sanitizeSpreadsheetCell`, and destroying the stream on error. It takes no `RequestEvent` and is logger-agnostic. The user-profile endpoint supplies its `columns`, a `fetchBatch` closure, and an `onError` callback (which logs through the endpoint's handler logger).

New external contract:

### `GET /admin/api/download/user-profile`

- **Does:** streams all onboarded users as an `.xlsx` download.
- **Use:** plain `GET`; no query params.
- **Depends on:** `generateReport`, `db.userProfile`.
- **Guarantees:** auth-gated; streamed, memory-bounded response with the four required columns.
- **Requires:** an authenticated admin session (enforced centrally and per-handler).

## Components / changes

The reports-area shell (slim `+layout.svelte`, card-grid index `reports/+page.svelte`, deleted redirect, relocated `reports/quiz/`) is owned by [Spec C](./2026-06-10-card-grid-report-index-design.md). This spec adds the following on top of it, plus one `ReportLink` entry for the user-profile card in Spec C's index list.

### 1. `src/routes/admin/(protected)/reports/user-profile/+page.server.ts` (new, load)

- Paginated `db.userProfile.findMany` + `db.userProfile.count`, reusing `PAGE_SIZE = 10`, `orderBy: { user: { name: 'asc' } }`, selecting `isSubscribed`, `user { name, email }`, `interests { collection { title } }`.

### 2. `src/routes/admin/(protected)/reports/user-profile/+page.svelte` (new, UI)

- "← Back to reports" link above the content (per [Spec C](./2026-06-10-card-grid-report-index-design.md)'s pattern).
- `Table` with columns Name, Email, Content Preferences, Subscribed?.
- `Paginator` (shown when `totalCount > pageSize`).
- Download XLSX `LinkButton` → `/admin/api/download/user-profile` (`data-sveltekit-reload`).
- Row mapping: `contentPreferences = interests.map((i) => i.collection.title).join(', ')`, `subscribed = isSubscribed ? 'Yes' : 'No'`.

### 3. `src/routes/admin/api/download/user-profile/+server.ts` (new)

Uses Spec A's `generateReport` helper (which owns streaming, headers, `Cache-Control: no-store`, per-cell `sanitizeSpreadsheetCell`, and destroying the stream on error):

- Auth check (401 if no `user`) — defense-in-depth atop the `/admin` hook guard.
- `columns`: Name, Email, Content Preferences, Subscribed?.
- `fetchBatch`: Prisma keyset cursor on `UserProfile.userId` (no filter — all onboarded users), ordered by `userId`, selecting `isSubscribed`, `user { name, email }`, `interests { collection { title } }`.
- `onError`: logs through the endpoint's handler logger; the helper stays logger-agnostic.
- Column values: `Content Preferences = interests.map((i) => i.collection.title).join(', ')`; `Subscribed? = isSubscribed ? 'Yes' : 'No'`.
- Filename `DDMMYYYYHHmmss_user_profile_report.xlsx`, sheet `"User Profile Report"`.

The on-screen preview (component 1) orders by `user.name` for readability; the download orders by `userId` per Spec A's keyset batching ([ADR-0002](../../decisions/0002-keyset-cursor-pagination-on-primary-key.md)). The two intentionally differ — the admin can sort the downloaded file in Excel.

## Error handling

- Unauthenticated request → 401 before any streaming (defense-in-depth atop the `/admin` hook guard).
- Mid-stream failures: `generateReport` destroys the stream and calls the endpoint's `onError` (which logs); see Spec A's Error handling and [ADR-0001](../../decisions/0001-stream-report-exports-with-exceljs.md).
- Load failures surface through SvelteKit's normal error path; each page renders its own report.

## Security considerations

Threats assessed via STRIDE / OWASP Top 10. This feature exports PII (names, emails, preferences), so disclosure and injection are the focus.

- **Access control (OWASP A01 — Broken Access Control; STRIDE: Elevation of Privilege, Information Disclosure).** Already enforced centrally: `src/routes/admin/hooks.server.ts` gates all `/admin/**` paths (unauthenticated → login redirect; inactive admin → signed out). The new `/admin/api/download/user-profile` route inherits this guard. The per-handler `if (!user) return 401` is kept as defense-in-depth, mirroring the quiz endpoint.
- **CSV / formula injection (OWASP A03 — Injection).** `user.name` is end-user-controlled (Google OAuth profile). A value like `=HYPERLINK(...)` or `=cmd|...` becomes a live formula when an admin opens the `.xlsx`. Neutralized by Spec A's `sanitizeSpreadsheetCell`, which `generateReport` applies to every string cell — so the user-profile export inherits the protection.
- **Information disclosure (STRIDE: Information Disclosure).** `generateReport` sets `Cache-Control: no-store` on the response so PII is not cached by browsers/proxies. Data minimization: only the four required fields are selected.
- **CSRF / Tampering.** N/A — the download is a read-only `GET` with no state mutation and takes no user input.
- **Denial of Service (STRIDE: DoS).** Addressed by Spec A: `generateReport` reads cursor-batched pages and streams output, so neither the full result set nor the file is held in memory.

## Testing

Mirror the existing quiz-report tests, AAA pattern with inline setup (no shared helpers). `generateReport` and `sanitizeSpreadsheetCell` are covered by Spec A; this spec tests the user-profile-specific pieces:

- Load (`user-profile/+page.server.ts`): returns onboarding records; pagination (skip); ordering by `user.name`.
- Endpoint: 401 when unauthenticated; correct columns; `fetchBatch` cursor advances across batches over all profiles; comma-joined topics; subscribed `Yes`/`No`; blank preferences when a user has no interests.
- Boundary conditions: empty result set renders the table's `emptyMessage`; only users with a `UserProfile` row appear (the intended population).
