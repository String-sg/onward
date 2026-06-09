# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Stack: SvelteKit (adapter-node) + Svelte 5 (runes) + Prisma (pg adapter) + Vitest, pnpm.

## Commands

Full command table in `README.md`; environment setup and code-style/hooks in `CONTRIBUTING.md`. Most-used:

- `pnpm dev` — dev server
- `pnpm test` — Vitest (watch). Single run: `pnpm test run <file>`; by name: `pnpm test run -t "<name>"`.
- `pnpm check` — `svelte-check` + type check (fails on warnings)
- `pnpm db:generate` after editing `prisma/schema.prisma`; `pnpm db:migrate` to create/apply a migration

## Architecture

Two apps in one SvelteKit project, split by route group, each with its own auth realm:

- `src/routes/(main)/` — learner-facing app (`learner.session` cookie)
- `src/routes/admin/` — admin app (`admin.session` cookie; requires an active `UserAdmin`)

**Hook dispatch.** Root `src/hooks.server.ts` routes each request to the matching group hook (`(main)/hooks.server.ts` or `admin/hooks.server.ts`) by `/admin` prefix — group hooks are _not_ auto-run by SvelteKit. Each is a `sequence()` of request logging (scoped pino logger + `X-Request-Id` on `event.locals.logger`) then auth/route-protection. **Auth is enforced centrally in these hooks**; endpoint-level `if (!user) 401` is defense-in-depth only.

**Auth.** Custom `Auth(valkey, …)` factory in `src/lib/server/auth/` (Google OAuth, sessions in Valkey). Exposes `learnerAuth` and `adminAuth`.

**Data.** Prisma Client is generated to `src/generated/prisma/` and re-exported (client + enums + model types) from `src/lib/server/db.ts`, which owns the single `db` instance over `@prisma/adapter-pg`. Import Prisma types from `$lib/server/db`, not the generated path.

**Server integrations** (`src/lib/server/`): `s3.ts` + `cloudfront.ts` (media + signed URLs), `openai.ts` (AI chat), `weaviate.ts` (vector search grounding the chat), `valkey.ts` (sessions + cache), `logger.ts` (pino). Feature logic under `auth/`, `chat/`, `unit/`, `cache/`.

**Domain (Prisma).** `Collection` → `LearningUnit` (content, sources, sentiments, tags, status) → `LearningJourney` (+ checkpoints, `QuestionAnswer` quizzes); AI chat via `Thread`/`Message`; onboarding via `UserProfile`/`UserInterest`.

**UI.** Components in `src/lib/components/<Name>/`; shared rune-based state in `src/lib/states/*.svelte.ts`.

## Gotchas

- `src/generated/prisma/` is machine-generated — never hand-edit; regenerate with
  `pnpm db:generate` after changing `prisma/schema.prisma`. (It's the only place
  using `type X = {}`; hand-written code uses `interface`.)
- `vendor/xlsx-0.20.3.tgz` is a vendored dependency, consumed only by the admin
  quiz export.
- **Prisma query args** order keys to follow **SQL clause order** — `select`,
  `where`, `orderBy`, `take`, `skip`, `cursor`. Type the args object with the
  generated `*FindManyArgs` / `*FindUniqueArgs` via `satisfies`, and derive row
  types with `*GetPayload<typeof args>`; never `as const`. Keep Prisma type
  annotations when simplifying code.

## Specs and decisions

Two linked conventions govern design docs:

- **Specs** live in `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`. Start
  from `docs/superpowers/specs/TEMPLATE.md` and follow
  `docs/superpowers/specs/README.md`. A spec carries the WHAT/WHY plus contracts
  and boundaries (the unit triple: does / uses / depends, with guarantees and
  requires) and records only the **chosen** solution. It must NOT contain
  implementation — no function bodies or loop internals; that belongs in the
  plan. Cover architecture, components, data flow, error handling, and testing.
  Write contract signatures as declaration-level TypeScript (no bodies), using
  `interface` for object shapes (the repo lints `consistent-type-definitions:
interface`) and reserving `type` for unions, function, and mapped/utility types.

- **Decisions** live in `docs/decisions/NNNN-<title>.md` as
  [MADR 4.0](https://adr.github.io/madr/) ADRs (start from
  `docs/decisions/TEMPLATE.md` — the full template; keep its optional
  sections, including Pros and Cons of the Options). When a spec involves a real
  architectural choice, the alternatives and rationale go in an ADR; the spec
  states the chosen outcome and links the ADR. See `docs/decisions/README.md`.
  **Author order: brainstorm → ADR → spec → plan.** The decision and its
  rationale are settled in the ADR first; the spec then derives its contracts from
  the chosen outcome. (The superpowers brainstorming skill writes the spec — pause
  after the design is approved to write the ADR, then return to the spec.)
  **ADRs stay prose** — decision, rationale, alternatives, consequences, described
  conceptually. An ADR may name external/framework symbols it builds on
  (`RequestEvent`, `Readable.toWeb`) but must NOT reference identifiers the spec
  defines — no backticked contract names like `fetchBatch`/`onError`, no function
  signature or `interface` block. Describe the role ("a batch-fetch closure", "an
  error callback"), not the name, so a rename in the spec can never make an
  accepted ADR stale; the names live in the spec.

- **Contracts flow down; never back-fill.** The signature is owned by the spec's
  Contracts & boundaries (declaration-level TS); the ADR holds the rationale in
  prose; the plan is _derived_ — it may mirror a contract in code for buildability
  but is never its source of truth. If plan or implementation work reveals a needed
  change to a signature, parameter, return type, error semantics, or a unit's
  dependency, **change the source doc first, then regenerate the affected plan
  section** — never edit the plan and back-fill the spec/ADR. A pure signature
  change (rename, reorder, add a field) is **spec-only**; an approach change with
  trade-offs **supersedes the ADR** (new ADR) and updates the spec signature. Plan
  self-review adds one check: do the signatures/guarantees in the plan match the
  spec's Contracts & boundaries? Grep the contract name across spec, plan, and ADR.

- **Diagrams:** use Mermaid fenced code blocks in both specs and ADRs.

## GitHub workflow

- Use the `gh` CLI for all GitHub operations (issues, PRs) — never raw git for PR
  actions and never the web UI.
- **gh-first, documented up front.** Every implementation plan documents the gh
  steps at its very start — read the issue (`gh issue view <#>`, when one exists),
  create the feature branch, open a **draft** PR (`gh pr create --draft`, body per
  `.github/PULL_REQUEST_TEMPLATE.md`) — and documents marking it ready
  (`gh pr ready`) as its final step. The gh workflow is established before the
  first task, not appended at the end.
- **Document-only; run on approval.** Writing these commands into the plan is not
  running them. The agent creates no branch, commit, push, or PR until you
  explicitly ask — the "don't commit/PR unless asked" rule stands.
