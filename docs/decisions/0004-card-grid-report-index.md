---
status: 'accepted'
date: 2026-06-10
decision-makers: santosral
consulted:
informed:
---

# Card-grid report index with per-page back navigation

## Context and Problem Statement

[ADR-0003](./0003-report-export-routing-and-page-routes.md) presents the two
reports in the admin **Generate Report** area as a shared layout nav — two links,
active by pathname — with `/admin/reports` redirecting to the default report. That
ADR deliberately deferred anything richer until a third report appeared ("minor
duplication … acceptable at two, to be revisited at three").

We now want the report-selection UI to stay readable as more reports are added,
rather than grow a horizontal nav strip that crowds or overflows. This revisits
only the **page-presentation** half of ADR-0003; its download-routing decision
(nested per-report endpoints) is unchanged and carries forward.

## Decision Drivers

- A selection UI whose readability does not degrade as the report count grows.
- No added complexity for the two reports that exist today.
- Self-contained, explicit report pages that are easy to read in isolation.
- Consistency with the codebase's preference for small duplication over
  speculative abstraction at low counts (the rule-of-three stance of ADR-0003).
- The admin sidebar already links to the reports area, so that entry point should
  land somewhere useful rather than bounce through a redirect.

## Considered Options

- A card-grid landing page with per-page back navigation
- Keep the shared layout tab nav and default-report redirect (status quo, ADR-0003)
- A scrollable / overflowing horizontal tab strip
- A single dropdown selector for the active report
- A left sidebar list of reports

## Decision Outcome

Chosen option: "A card-grid landing page with per-page back navigation."

The reports area entry point becomes a landing page that presents each report as a
card (title and a one-line description); selecting a card opens that report's own
page. The default-report redirect is removed — the landing page is the
destination — and the shared tab nav is dropped, since the grid is now the
switcher. Each report page carries a back affordance to the landing page.

The set of reports shown on the landing page is inline presentational data
co-located with the landing page, not a shared registry the endpoints or pages
derive behaviour from: each report page and each download endpoint stays
independent, exactly as in ADR-0003. The back affordance likewise lives on each
report page rather than in shared chrome, keeping every page readable top to
bottom and avoiding a layout that has to special-case its landing route.

A card grid of two cards is no more complex than two nav links, and an inline
list of two entries is the same shape as the nav array it replaces, so this is a
lateral presentation choice — not abstraction ahead of need — whose layout simply
does not crowd as the report count rises.

### Consequences

- Good, because the landing grid stays readable as reports are added, where a
  horizontal nav strip would crowd or overflow.
- Good, because the change adds no complexity at the current count of two: a grid
  of two cards and a two-entry list match the prior two-link nav.
- Good, because each report page is self-contained — its own content and its own
  back affordance — with no shared layout branching on which child is the landing
  route.
- Good, because the sidebar entry now lands on a useful overview instead of an
  immediate redirect.
- Bad, because the back affordance is repeated per report page and the landing
  list gains one entry per report — small duplication, accepted at low counts and
  to be revisited (a shared back-link element, or promoting the list to its own
  module) when a third-plus report makes it nag.
- Bad, because reaching a report now passes through the landing page rather than a
  direct default — one extra step, traded for a clearer overview.

### Confirmation

The reports landing route renders one card per report and no longer redirects;
each report page renders a back affordance to the landing route and the shared tab
nav is gone; reviewers confirm the report list is inline presentational data (no
shared registry) and that the nested per-report download endpoints from ADR-0003
are untouched.

## Pros and Cons of the Options

### Card-grid landing page with per-page back navigation

- Good, because a grid scales to more reports without the layout crowding.
- Good, because it is equal in complexity to the prior nav at two reports.
- Good, because pages stay explicit and self-contained.
- Bad, because the back affordance and a list entry are repeated per report.

### Keep the shared layout tab nav and redirect (status quo)

- Good, because it is already built and is minimal for two reports.
- Bad, because a horizontal nav strip crowds and eventually overflows as reports
  are added — the very thing this decision sets out to avoid.

### Scrollable / overflowing horizontal tab strip

- Good, because it is a small change from the status quo.
- Bad, because horizontal scrolling hides reports off-screen and reads poorly;
  it postpones rather than solves the crowding.

### Single dropdown selector

- Good, because it is compact and scales to many reports.
- Bad, because it hides the list behind a control and shows no description, making
  reports less discoverable than cards.

### Left sidebar list

- Good, because a vertical list scales cleanly.
- Bad, because it adds a second persistent nav column inside a page that already
  sits next to the admin sidebar, competing for the same affordance.

## More Information

Supersedes the page-presentation decision of
[ADR-0003](./0003-report-export-routing-and-page-routes.md); that ADR's
download-routing decision remains accepted. The chosen outcome is realised in the
[User Profile Report spec](../superpowers/specs/2026-06-08-user-profile-report-design.md),
which states the presentation as built and links back here for the rationale.
