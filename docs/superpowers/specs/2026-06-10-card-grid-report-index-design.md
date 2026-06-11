# Card-Grid Report Index — Design

**Status:** Approved
**Rationale (ADR):** [ADR-0004 — Card-grid report index with per-page back navigation](../../decisions/0004-card-grid-report-index.md), which supersedes the page-presentation decision of [ADR-0003](../../decisions/0003-report-export-routing-and-page-routes.md) (its download-routing decision carries forward unchanged).
**Related:** [User Profile Report](./2026-06-08-user-profile-report-design.md) (Spec B) adds the second report card on top of this structure; [Streaming Report Exports](./2026-06-08-streaming-report-exports-design.md) (Spec A) owns the export mechanism. This spec is the reports-area restructure; it lands before Spec B.

## Overview

The admin **Generate Report** area (`/admin/reports`) currently presents its reports as a horizontal tab strip in a shared layout, with `/admin/reports` redirecting to the quiz report (the default). That strip crowds and eventually overflows as reports are added.

This spec restructures the area into a **card-grid landing page**: `/admin/reports` becomes an index that lists each report as a card (title and one-line description); selecting a card opens that report's own sibling page; each report page carries a "← Back to reports" link to the index. The default-report redirect is removed and the tab nav is dropped — the grid is the switcher.

At restructure time the area holds a single report (quiz), which is relocated from the `reports/` root into its own `reports/quiz/` sibling so the index sits at the root. The grid renders one card. [Spec B](./2026-06-08-user-profile-report-design.md) immediately adds the second card (user-profile).

Scope: this is a presentation/routing change only. No report's data load, query, or download endpoint changes.

## Goals

- **Goal:** the report-selection UI stays readable as reports are added, instead of growing a crowding nav strip.
- **Goal:** each report page is self-contained — its own content and its own back affordance — with no shared layout branching on which child is the index.
- **Non-goal:** no shared report registry; the report list is inline presentational data (per [ADR-0004](../../decisions/0004-card-grid-report-index.md)).

## Architecture

> Decision: card-grid report index with per-page back navigation (see [ADR-0004](../../decisions/0004-card-grid-report-index.md)). The nested per-report download endpoints from [ADR-0003](../../decisions/0003-report-export-routing-and-page-routes.md) are untouched.

The reports area is reshaped under `src/routes/admin/(protected)/reports/`:

- The shared `+layout.svelte` is slimmed to **only** the page container — no header, no tab nav, no reusable `Tabs` component. It renders the active page via the `children` snippet.
- `reports/+page.svelte` becomes the **index**: a "Generate Report" heading plus a responsive grid of report cards. The cards are built from an inline list of report links co-located with the page — the same shape as the former tab array, relocated. The page has no `+page.server.ts` and no data load.
- The former redirect at `reports/+page.server.ts` is **deleted** — the index is now the destination for the admin sidebar's "Generate Report" entry.
- The existing quiz report (`+page.server.ts` + `+page.svelte`) is **relocated** unchanged from the `reports/` root into `reports/quiz/`, and gains a "← Back to reports" link above its content.

Each report page (now and in future) renders its own back affordance to the index rather than sharing a back link in layout chrome, keeping every page readable top to bottom and the layout free of any "is this the index route?" special-casing.

## Contracts & boundaries

This spec introduces no new reusable or external contract — it is a presentation/routing change. Its units are presentational:

### Unit: report-index card list

- **Does:** lists the area's reports as cards (title, one-line description, link to the report page).
- **Use:** the index page maps a static, co-located array of report links to cards.
- **Depends on:** nothing server-side — no load, no Prisma, no endpoint.

The list is inline presentational data, **not** a shared registry the pages or download endpoints derive behaviour from. Its element shape (declaration-level):

```ts
interface ReportLink {
  title: string;
  description: string;
  href: string;
}
```

Adding a report is one new `ReportLink` entry plus its route — no abstraction to extend.

### Unit: per-page back affordance

- **Does:** returns the admin from a report page to the index.
- **Use:** each report page renders a "← Back to reports" link to `/admin/reports`, above its content.
- **Depends on:** nothing — a static link; intentionally duplicated per page rather than hoisted into shared chrome (per [ADR-0004](../../decisions/0004-card-grid-report-index.md); revisit at the third-plus report).

### Unit: reports layout container

- **Does:** provides the shared page container for the index and every report page.
- **Use:** renders the `children` snippet inside `mx-auto max-w-6xl …`.
- **Depends on:** nothing — no header, no nav, no data load.

## Components / changes

### 1. `src/routes/admin/(protected)/reports/+layout.svelte` (modified)

- Slimmed to only the shared page container, rendering the active page via the `children` snippet. The "Generate Report" header and the tab nav are removed. No data load.

### 2. `src/routes/admin/(protected)/reports/+page.svelte` (new, index)

- The "Generate Report" landing page: a heading plus a responsive grid of report cards, each card showing a report's title and one-line description and linking to its page.
- Cards are built from an inline `ReportLink[]` co-located with the page. At this point the list has one entry (quiz); Spec B adds the second.
- Static presentational markup — no `+page.server.ts` and no data load.

### 3. `src/routes/admin/(protected)/reports/+page.server.ts` (deleted)

- The redirect to the default report is removed; `/admin/reports` now renders the index directly.

### 4. `src/routes/admin/(protected)/reports/quiz/+page.server.ts` and `+page.svelte` (relocated)

- The existing quiz-report load and UI, moved unchanged from the former `reports/` root (quiz dropdown + paginated `learningJourney`; preview table, paginator, and download link → `/admin/api/download/quiz?quizId=...`), with a "← Back to reports" link added above the content.

## Data flow

1. The admin sidebar's "Generate Report" entry links to `/admin/reports`, which now renders the card-grid index directly (no redirect).
2. Selecting a card navigates to that report's sibling page (`reports/<report>/`), which runs its own load and renders its preview + download.
3. The report page's "← Back to reports" link returns to `/admin/reports`.

## Error handling

No new error paths. Removing the redirect means `/admin/reports` resolves to the index page (a 200 with the grid) instead of a 307. Report-page load failures continue to surface through SvelteKit's normal error path, each page rendering its own report. Auth is unchanged: `src/routes/admin/hooks.server.ts` still gates all `/admin/**` paths centrally.

## Testing

This spec is a pure presentation/routing change with no new server logic — the only server-side edit is deleting the redirect load. The repo does not component-test route `+page.svelte` / `+layout.svelte` files (route logic is covered by `+page.server.test.ts` / `server.test.ts`; only `$lib` components have `@testing-library/svelte` tests), and this spec adds no new route logic. So verification is:

- `pnpm check` — svelte-check + type check passes after the redirect load and its `$types` import are removed and the index/layout markup changes land.
- Manual smoke (`pnpm dev`): `/admin/reports` renders the card grid (no redirect to `/admin/reports/quiz`); each card links to its report; each report page shows a "← Back to reports" link that returns to the index.

No new automated tests are introduced — there is no server logic to cover, and adding route-page component tests would introduce a pattern the repo does not use. The relocated quiz report keeps its existing server-load coverage unchanged.
