---
status: 'accepted'
date: 2026-06-08
decision-makers: santosral
consulted:
informed:
---

# Read streaming exports with keyset cursor pagination on the primary key

## Context and Problem Statement

The streaming export ([ADR-0001](./0001-stream-report-exports-with-exceljs.md)) reads rows from the database in batches inside a loop that runs until the data is exhausted. How should each batch be fetched so the per-batch cost stays constant at any depth and rows are neither skipped nor duplicated under concurrent writes?

## Decision Drivers

- Constant per-batch cost regardless of how deep into the result set the loop has read.
- Stability under concurrent writes — no skipped or duplicated rows.
- Keep Prisma's typed query API.

## Considered Options

- Keyset (cursor) pagination ordered by the model's primary key
- Offset pagination (`skip` / `take`)
- A true DB server-side cursor via the raw `pg` driver (`pg-query-stream`)

## Decision Outcome

Chosen option: "Keyset pagination ordered by the primary key", because it is linear and index-backed (constant cost per batch) and stable under concurrent writes, while staying within Prisma's typed cursor API.

A consequence is that the export is **no longer ordered by `user.name`** (today's behavior). Name lives on the related `User` and is non-unique, so it cannot back a clean keyset cursor; since an admin can sort any column in Excel, server-side name ordering is dropped in favor of primary-key ordering.

### Consequences

- Good, because batch cost is constant and index-backed at any depth.
- Good, because the read is stable under concurrent inserts/deletes (no skip/duplicate).
- Good, because it stays within Prisma's typed API.
- Bad, because the exported rows are ordered by primary key rather than `user.name`; mitigated because the admin can sort the downloaded file in Excel.
- Neutral, because a true server-side cursor (`pg-query-stream`) would remove repeated queries entirely but bypasses Prisma's typed API — deferred as an escalation path if scale ever demands it.

### Confirmation

Endpoint tests assert the cursor advances across multiple batches and the `where` filter is honored; the `fetchBatch` contract returns `{ rows, nextCursor }` and the loop terminates when `nextCursor` is undefined.

## Pros and Cons of the Options

### Keyset cursor on the primary key

- Good, because cost per batch is constant and index-backed.
- Good, because it is stable under concurrent writes.
- Bad, because ordering is tied to the key, not a human-friendly column.

### Offset pagination (`skip` / `take`)

- Good, because it can order by any column, including `user.name`.
- Bad, because cost grows with depth and rows can be skipped or duplicated when the underlying set changes mid-export.

### Raw `pg` server-side cursor (`pg-query-stream`)

- Good, because it removes repeated queries entirely.
- Bad, because it bypasses Prisma's typed API — too much for current scale (deferred).
