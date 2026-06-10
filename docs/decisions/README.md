# Architecture Decision Records

This directory holds Architecture Decision Records (ADRs) following the
[MADR 4.0](https://adr.github.io/madr/) standard. Each ADR captures one
architectural decision: the problem, the options considered, the chosen option,
and its consequences (good _and_ bad).

## Relationship to specs

Design specs live in [`../superpowers/specs/`](../superpowers/specs/). A spec
records only the **chosen** solution and links out to the relevant ADR here for
the full rationale and the alternatives that were rejected. The decision lives in
the ADR; the spec consumes its outcome.

> Rule of thumb: if you're writing "we considered X but chose Y because…", that
> belongs in an ADR, not the spec. The spec just states Y and links the ADR.

## Conventions

- **One decision per file**, named `NNNN-kebab-title.md` (zero-padded, e.g.
  `0001-stream-report-exports-with-exceljs.md`). Numbers are sequential and never
  reused.
- **Start from the template:** copy [`TEMPLATE.md`](./TEMPLATE.md) (the
  official MADR 4.0 full template). Keep its optional sections — including Pros
  and Cons of the Options — so every decision records its alternatives and
  rationale.
- **Frontmatter** carries `status`, `date`, `decision-makers`, `consulted`,
  `informed`. For a solo/small-team change, `status` + `date` is enough; leave
  the rest blank.
- **Status lifecycle:** `proposed` → `accepted` → (later) `deprecated` or
  `superseded by ADR-NNNN`. A `rejected` option is recorded too if it was
  seriously considered.
- **Immutable once accepted:** don't rewrite an accepted ADR. If the decision
  changes, write a new ADR that supersedes it and update the old one's status.

## Index

- [0001 — Stream report exports end-to-end with ExcelJS via a generic helper](./0001-stream-report-exports-with-exceljs.md) — accepted
- [0002 — Read streaming exports with keyset cursor pagination on the primary key](./0002-keyset-cursor-pagination-on-primary-key.md) — accepted
- [0003 — Nested per-report download endpoints and separate per-report page routes](./0003-report-export-routing-and-page-routes.md) — accepted
- [0004 — Card-grid report index with per-page back navigation](./0004-card-grid-report-index.md) — accepted
