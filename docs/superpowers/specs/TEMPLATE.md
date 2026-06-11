# <Feature> — Design

<!--
SPEC TEMPLATE — read before filling in. See README.md for the full conventions.

A spec answers WHAT we're building and WHY, and defines the CONTRACTS and
BOUNDARIES other work depends on. It does NOT contain implementation: no function
bodies, no loop internals. That is the plan's job.

Decisions: record only the CHOSEN solution here. The alternatives considered and
the full rationale go in an ADR under docs/decisions/ (MADR 4.0); link it.

Altitude test for anything you add:
  - Contract / interface / chosen outcome a reviewer or sibling spec must consume -> here
  - Internal mechanics a competent engineer could write 3 valid ways -> the plan
  - "We considered X but chose Y because…" -> an ADR in docs/decisions/, linked from here

Diagrams: use Mermaid fenced blocks. Scale each section to its complexity and
DELETE optional sections that don't apply (an empty section reads as unanswered).
Delete these comments in the real spec.
-->

**Status:** Draft <!-- Draft | Approved -->
**Depends on / Related:** <link sibling specs/ADRs, or delete>

## Overview

<!--
Problem first, then the solution, then why this approach — one tight description.
A reader should finish knowing what's broken/missing, what we'll build, and why
it's worth doing. State the scope boundary explicitly (what this does NOT cover,
especially if a sibling spec covers it).
-->

## Goals

<!-- Bullets. The success criteria the design must meet. Lead with the quality
attribute being optimized (e.g. bounded memory, p99 latency, auditability) when
there is one. Scope exclusions belong in the Overview's scope-boundary line, not
here. -->

- **Goal:** …

## Requirements

<!-- OPTIONAL — feature specs. Externally-defined must-haves (e.g. from the
issue). A column/format table is ideal when output shape is fixed. Delete for
pure refactors. -->

## Data model

<!-- OPTIONAL — when the work touches the schema or non-obvious relations. Name
only the models/fields/relations involved and how they map to the feature; don't
restate the whole schema. An ER diagram (Mermaid `erDiagram`) helps when
relations are the point. Delete if not applicable. -->

## Architecture

<!--
Describe the CHOSEN design and how it works at the contract level — components and
how data flows between them. Use a Mermaid diagram when the flow is non-trivial.
Do NOT relitigate alternatives here; for any significant decision, link the ADR
that records the options and rationale:

> Decision: <chosen approach>. See [ADR-0001](../../decisions/0001-<slug>.md).

```mermaid
flowchart LR
  A[Request] --> B[Handler] --> C[(DB)]

````
-->

## Contracts & boundaries

<!--
For each NEW or CHANGED unit (module, helper, endpoint), state the boundary so a
consumer never needs to read the internals:

### `unit name`
- **Does:** <one line — its single purpose>
- **Use:** <how a caller invokes it; include the type SIGNATURE, no body>
- **Depends on:** <what it needs>
- **Guarantees:** <postconditions — what callers can rely on>
- **Requires:** <preconditions — what the caller must provide / hold>

Information-hiding test: can the internals change without breaking consumers? If
not, the boundary is wrong.

Write these as declaration-level TypeScript — signatures only, never bodies. Use
`interface` for object shapes (this repo lints `consistent-type-definitions:
interface` via the typescript-eslint stylistic preset); reserve `type` for
unions, function types, and mapped/utility types. Type imports are inline
(`import { type Foo }`).

```ts
interface Thing<T> { … }
doThing(input): Output;
````

-->

## Components / changes

<!--
Concrete, file-level list of what changes — one numbered entry per file/unit:
path, new|moved|modified, and WHAT it does at the contract level (columns,
inputs, outputs, filters). No code bodies. Call out preserved behavior explicitly
when rewriting existing code.
-->

### 1. `path/to/file` (new | moved | modified)

…

## Error handling

<!-- How failures are handled at each boundary: what's validated, what's caught,
what status/log/abort results. Call out failures that can't become a clean error
(e.g. mid-stream after headers are sent). -->

## Security considerations

<!--
Threats via STRIDE / OWASP Top 10, scaled to the feature. Per relevant threat:
name it (with tag), state the exposure, state the mitigation (or why N/A). Be
explicit about what's handled centrally (e.g. an auth hook) vs. in this change.
Say "N/A — <reason>" rather than omitting a category.
-->

- **Access control (OWASP A01; STRIDE: EoP / Info Disclosure).** …
- **Injection (OWASP A03).** …
- **Information disclosure (STRIDE).** …
- **CSRF / Tampering.** …
- **Denial of Service (STRIDE).** …

## Testing

<!--
Test cases that prove the spec is satisfied, at the behavior level. Follow the
project's test conventions (AAA, inline setup, no shared helpers). Group by unit.
Include boundary conditions as cases (empty result set, missing optional field,
single vs multiple batches); error-path conditions belong in Error handling.
State what's covered elsewhere (e.g. a dependency spec) to avoid implying
duplication.
-->
