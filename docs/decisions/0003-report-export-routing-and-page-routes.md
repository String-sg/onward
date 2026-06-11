---
status: 'accepted'
date: 2026-06-08
decision-makers: santosral
consulted:
informed:
---

# Nested per-report download endpoints and separate per-report page routes

## Context and Problem Statement

The user profile report adds a second report to the admin **Generate Report** area (`/admin/reports`) alongside the existing quiz report, plus a second download endpoint. Two structural choices follow: how to shape the download routes, and how to present the two reports. How should each be done without over-engineering for two reports?

## Decision Drivers

- Single-purpose, easy-to-read handlers and page loads.
- A clear "report exports" family in the route tree.
- Server-side pagination kept working per report.
- Pages and API endpoints kept in separate route trees.
- No speculative abstraction for what is currently two reports (rule of three).

## Considered Options

Download routing:

- Nested per-report endpoints — `admin/api/download/quiz` and `admin/api/download/user-profile`
- A single endpoint with a `?type=` query-param discriminator
- A shared config/registry the endpoints derive from

Page presentation:

- Separate per-report page routes with a shared layout nav — `admin/reports/quiz` and `admin/reports/user-profile`
- Inline tabs driven by a `?tab=quiz|user-profile` query param on one page
- A reusable `Tabs` component

## Decision Outcome

Chosen options: "Nested per-report download endpoints" and "Separate per-report page routes".

Each download is its own single-purpose handler under `admin/api/download/{quiz,user-profile}`, keeping the export family obvious in the tree and keeping downloads — which are API endpoints that stream a file — in the API route tree, separate from the page routes.

Each report preview is its own page route under `admin/(protected)/reports/{quiz,user-profile}`. A shared `+layout.svelte` renders the "Generate Report" header and the report nav (two links, active by pathname), and `/admin/reports` redirects to the quiz report (the default). Because each page's load runs only its own queries, server-side pagination keeps working per report without tab-branching or a discriminated-union page payload.

No reusable `Tabs` component is introduced: the nav is two links in a layout, with no ARIA/keyboard widget complexity, and two reports do not meet the rule of three.

### Consequences

- Good, because each page load and each download handler stays single-purpose.
- Good, because per-page loading keeps server-side pagination working for both reports, with no discriminated-union payload or tab branching.
- Good, because pages and API endpoints remain in cleanly separated route trees.
- Good, because no abstraction is built ahead of need.
- Bad, because there is minor duplication between the two page routes, the two endpoints, and the two nav links; acceptable at two, to be revisited at three.

### Confirmation

Spec B has separate page routes whose loads each query only their own dataset; the new `download/user-profile` endpoint exists as a sibling of `download/quiz`; a shared reports layout renders the nav and `/admin/reports` redirects to the default; reviewers confirm no shared discriminator/registry and no reusable `Tabs` component were introduced.

## Pros and Cons of the Options

### Nested per-report endpoints

- Good, because each handler is single-purpose and discoverable, and downloads stay in the API tree.
- Bad, because a little setup is repeated per endpoint.

### Single endpoint with `?type=` discriminator

- Good, because one file.
- Bad, because it becomes a multi-purpose branchy handler.

### Shared config/registry

- Good, because exports become data.
- Bad, because it is over-engineering for two reports (YAGNI).

### Separate per-report page routes

- Good, because each page is single-purpose, its load has no tab branching or union payload, and pages stay separate from API endpoints.
- Bad, because a little setup, and the nav, is repeated per page.

### Inline query-param tabs

- Good, because there is only one page route.
- Bad, because the load branches per tab and the page carries a discriminated-union payload.

### Reusable `Tabs` component

- Good, because it would centralize tab behavior.
- Bad, because two simple reports do not justify it (rule of three).
