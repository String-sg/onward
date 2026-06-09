---
status: 'accepted'
date: 2026-06-08
decision-makers: santosral
consulted:
informed:
---

# Stream report exports end-to-end with ExcelJS via a generic helper

## Context and Problem Statement

The admin quiz export (`admin/api/download`) loads every matching row into memory, builds the whole workbook, and serializes it to a single buffer before sending, so memory scales linearly with row count. As data grows a single export can spike memory and destabilize the server. We also have a second report (onboarding) coming that would otherwise copy the same buffered pattern. How should report exports be produced so memory stays bounded and the logic is reusable?

## Decision Drivers

- Bounded memory regardless of dataset size — neither the full result set nor the full file should be held in memory.
- Reusable across reports so additional exports plug in without re-implementing streaming.
- Keep Prisma's typed query API.
- Avoid duplicating the error-prone streaming loop per endpoint.

## Considered Options

- Stream end-to-end with `ExcelJS.stream.xlsx.WorkbookWriter` piped to the HTTP response, encapsulated in a single generic streaming helper
- Buffer-then-send (the current approach) — build the whole workbook in memory, send one buffer
- Thin streaming utilities only — expose helpers but let each endpoint own its streaming loop
- A config/registry-driven export framework that endpoints register against

## Decision Outcome

Chosen option: "Stream end-to-end with ExcelJS via a generic streaming helper", because it is the only option that bounds memory on both the DB read and the file write while keeping each endpoint tiny and declarative.

The helper writes through a Node `stream.PassThrough`, whose readable side is converted with `Readable.toWeb()` and returned as the SvelteKit `Response` body. The write loop runs un-awaited so the response starts streaming immediately; because it is not awaited it carries its own `.catch`. Once streaming starts the status and headers are already sent, so a mid-export error cannot become a clean 500 — the helper hands the failure back to the caller through an injected error callback (which logs server-side) and destroys the stream, leaving the browser with a failed/incomplete download to retry. Keeping the helper logger-agnostic and free of any SvelteKit request object decouples it from the framework and makes it trivially unit-testable. (Cursor batching of the DB read is a separate decision — see [ADR-0002](./0002-keyset-cursor-pagination-on-primary-key.md).)

### Consequences

- Good, because memory is bounded regardless of dataset size, removing the DoS vector.
- Good, because one tested helper owns all the streaming complexity and endpoints only declare their columns, a batch-fetch closure, and an error callback.
- Good, because migrating the quiz export off the vendored `xlsx` tarball lets us remove that dependency entirely.
- Bad, because a mid-stream error after headers are sent cannot be a clean error response — the admin sees a broken download and retries.
- Bad, because the un-awaited write loop must carry its own `.catch` or a failure surfaces as an unhandled rejection.
- Bad, because it adds `exceljs` as a dependency.

### Confirmation

The quiz endpoint is rewritten to call the streaming helper and the vendored `xlsx` dependency is removed; tests assert the helper drives the batch fetcher to exhaustion, produces a readable stream, and aborts + reports the failure on a fetch error.

## Pros and Cons of the Options

### Stream end-to-end via a generic streaming helper

- Good, because it bounds memory on both read and write.
- Good, because the streaming loop is written and tested once.
- Bad, because the abstraction must be generic enough for every report (a columns + batch-fetch contract).

### Buffer-then-send (current approach)

- Good, because errors can still become a clean 500 (nothing is sent yet).
- Bad, because memory scales with row count — the problem we are removing.

### Thin streaming utilities only

- Good, because no large abstraction to design.
- Bad, because every endpoint re-implements the error-prone streaming/abort loop.

### Config/registry-driven framework

- Good, because exports become pure data.
- Bad, because it is over-engineering for the current two reports (YAGNI).
