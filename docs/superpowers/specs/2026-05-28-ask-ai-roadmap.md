# Ask AI — Evolution Roadmap

**Status:** Pre-implementation roadmap (post-Stage 1 stages to be triggered by telemetry from Stage 1)
**Date:** 2026-05-28
**Related spec:** [`2026-05-28-ask-ai-grounding-design.md`](./2026-05-28-ask-ai-grounding-design.md) (Stage 1 / PR 1)

---

## Purpose

Stage 1 (grounding via function tools) is the only spec written so far. Stages 2–4 evolve the Ask AI feature toward a more tutor-like experience over multiple shippable PRs. **Each later stage needs its own spec written before implementation begins.** This document tracks the roadmap so the items don't get lost; it is not a substitute for per-stage specs.

When ready to start a stage:

1. Verify the start trigger has been met (typically telemetry from the previous stage).
2. Open a GitHub issue using the entry below as the seed.
3. Write a per-stage spec (`docs/superpowers/specs/YYYY-MM-DD-ask-ai-<stage>-design.md`).
4. Implement the PR.

---

## Architectural progression

Each PR is independently deployable; no broken intermediate states.

```
PR 1   Grounding via function tools          (SPEC: written; PR: not yet implemented)
  └─►  PR 2   Unit-context awareness         (SPEC: to be written when triggered)
         └─►  PR 3.1 Multi-tool + related units  (SPEC: to be written)
                └─►  PR 3.2 Personalization tool   (SPEC: to be written)
                       └─►  PR 4.1 Conversational replies (SPEC: to be written)
                              └─►  PR 4.2 Tutor voice / Socratic  (SPEC: to be written)
```

---

## PR 2 — Unit-context awareness (prompt-only)

**Summary:** When the user is on a unit page, the AI answers in the context of that unit. Client sends optional `currentUnitId`; server fetches `LearningUnit.title` / `summary` / `objectives` and injects them as a context note in the developer message. No new tool, no architecture change.

**Depends on:** PR 1 merged and deployed.

**Start trigger:** 1–2 weeks of PR 1 in production AND telemetry shows users asking unit-specific questions (e.g., "what did we just cover?"). If users don't ask unit-aware questions in practice, deprioritize.

**Approx. scope:** 150–300 lines across `+server.ts`, `ask-ai.ts`, one Prisma read. No schema change.

**Deployability:** Fully backward-compatible. If client doesn't send `currentUnitId`, behavior identical to PR 1.

**Spec status:** Not written. Write before starting implementation.

**Open questions to settle in its spec:**

- Should `Thread.currentUnitId` be added so context persists across turns of one chat? Or recompute per request?
- How is unit access authorization handled (likely via `LearningJourney` lookup)?
- What's the exact prompt section structure for the unit context block?

---

## PR 3.1 — Multi-tool architecture + `find_related_units`

**Summary:** Add a second tool that returns "next learning units" recommendations. Switch `tool_choice: 'required'` → `'auto'`. Add a bounded multi-iteration tool loop (max 3 iterations). Update the gate semantics to handle "model legitimately answered via a non-retrieval tool."

**Depends on:** PR 1; ideally PR 2 first so context-aware suggestions are possible.

**Start trigger:** Telemetry shows learners completing units and wanting next-step guidance. Tool design choice (Weaviate similarity vs. Prisma traversal of Tags/Collections/LearningJourney) should also be informed by which signals look strongest in production.

**Approx. scope:** 400–600 lines. This is the largest architectural shift after PR 1.

**Deployability:** New tool exists but model may not call it; if it only calls `search_learning_content`, behavior matches PR 1/2. Gate change is additive.

**Spec status:** Not written.

**Open questions to settle in its spec:**

- Tool implementation: Weaviate (semantic similarity over unit-level vectors) vs. Prisma (Tag/Collection/Journey traversal). Each has trade-offs.
- Does Weaviate need a new collection (`LearningUnitMeta` vectorized on title + summary + objectives) or can we group results from the existing `LearningUnit` chunk-level collection?
- How does the gate distinguish "model attempted to answer factually without retrieval" from "model legitimately called a non-search tool"?
- Tool-loop iteration cap — 3? 5?

---

## PR 3.2 — `get_user_progress` (personalization)

**Summary:** Add a tool that returns the user's progress: completed units, in-progress units, recent activity, quiz scores. Prompt updates to encourage the model to tailor depth (more detail for new learners, less for advanced).

**Depends on:** PR 3.1 (uses the multi-tool architecture).

**Start trigger:** After PR 3.1 ships and telemetry shows users actually engaging with related-unit suggestions. Don't add personalization signal before related-unit signal proves itself.

**Approx. scope:** 200–300 lines.

**Deployability:** Additive. Model may or may not call the tool.

**Privacy/security note:** This is the first PR that puts personal learning data (quiz results, progress) into LLM context. Requires a separate privacy review pass before merging:

- What data is sent to OpenAI? Confirm Azure data-residency / opt-out settings.
- Do we log the tool result? If so, where, and is it PII?
- Does the user have a way to opt out of personalization?

**Spec status:** Not written.

---

## PR 4.1 — Conversational-reply support (relaxed gate)

**Summary:** Today, every user message goes through forced retrieval + gate. PR 4.1 allows the model to skip retrieval for clearly conversational replies ("yes", "more", "I don't get it") without triggering refusal. Either: pre-classify intent before retrieval, or change `tool_choice` strategy with a no-tool fallback path, or use a heuristic on message shape.

**Depends on:** PR 3.1 (multi-tool architecture in place).

**Start trigger:** Telemetry shows users abandoning chats after canned refusals to follow-up messages. If users don't try multi-turn dialogue in production, deprioritize. **This is the largest architectural shift in the roadmap — design it with real production data, not assumptions.**

**Approx. scope:** 300–500 lines depending on approach.

**Deployability:** Intent handling fires only on clearly conversational inputs. Factual questions still go through the gate.

**Spec status:** Not written.

**Open questions to settle in its spec:**

- Intent detection method: pre-classifier LLM call (latency cost) vs. message-shape heuristic (brittle) vs. relaxed `tool_choice` (model decides).
- How to prevent abuse: a user could phrase an off-topic factual question conversationally to bypass the gate ("oh and also tell me about X"). Defense?
- What does the gate look like when the model can legitimately answer without any tool call?

---

## PR 4.2 — Tutor voice / Socratic prompt

**Summary:** Introduce a `<teaching_style>` section in the developer message and relax `<tone>` to allow check-understanding questions, brief Socratic prompts, and inviting the user to continue thinking. Pure prompt-only changes.

**Depends on:** PR 4.1 (the architecture must support conversational replies for the Socratic flow to be useful).

**Start trigger:** After PR 4.1 is stable and conversational-reply behavior works as expected.

**Approx. scope:** 50–100 lines. Easiest to deploy / revert.

**Deployability:** Prompt-only. Trivial to roll back.

**Spec status:** Not written.

---

## Optional / opportunistic

- **`Thread.currentUnitId` migration** — forward-compatible nullable column. Ship alongside PR 2 or as a standalone chore.
- **`Thread.mode` (`QA | TUTOR`)** — if persistent mode switching becomes valuable. Probably not needed before PR 4.1.
- **Cross-encoder re-ranker** — listed in spec Section 11. Add only if `maxVectorDistance` calibration proves insufficient after PR 1.
- **GovernanceEvent audit log** — explicitly dropped from PR 1 scope. If governance review later requires structured per-request audit data, revive as its own PR.

---

## Notes on parallelization

- PR 2 can be designed/started while PR 1 is in review.
- PR 3.1 can be designed while PR 2 is in production.
- PR 4.1's design choices _must_ be informed by real production telemetry from PRs 1–3. Don't pre-design it.

## Notes on deferring vs. cancelling

Each stage's `Start trigger` is a real gate. If telemetry doesn't justify a stage (e.g., users don't try multi-turn dialogue), the right answer is "cancel that stage," not "ship it anyway." This roadmap is a list of _possible_ next steps, not a commitment.
