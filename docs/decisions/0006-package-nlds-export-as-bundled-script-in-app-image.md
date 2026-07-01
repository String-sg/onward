---
status: 'accepted'
date: 2026-07-01
decision-makers: [Onward app team]
consulted: []
informed: [Transform infra team]
---

# Package the NLDS export as a bundled script inside the existing app image

## Context and Problem Statement

A daily scheduled ECS task must run a batch export from the Onward database to
the NLDS-owned S3 data lake. The infra side is already drafted around
**reusing the learner (app) image** and invoking `pnpm run export:nlds`; the task
runs to completion and exits.

The complication is what actually ships in that image. The production Docker stage
copies only `build/`, `prisma/`, `package.json`, and the pruned **production**
`node_modules`. It does **not** copy `src/`, and it does **not** include
`tsx`/`dotenv` (both devDependencies). Two consequences follow: the
`node --import=tsx` pattern used by the seed script cannot run in the container,
and the generated Prisma client — emitted as **TypeScript** under
`src/generated/prisma/` by the Prisma 7 `prisma-client` generator — is absent
from the image except where the app's build has already bundled it into `build/`.
`pg` is likewise not directly importable under pnpm's strict layout, since it is
only a transitive dependency of the Postgres driver adapter.

So the export cannot be a raw TypeScript file executed by an interpreter at
runtime. Some form of ahead-of-time compilation is required, and we must decide
where that artifact lives and how the task reaches it.

## Decision Drivers

- **Honor the fixed infra contract** — reuse the learner image; command is
  `pnpm run export:nlds`; exit code drives alerting.
- **Add no new runtime dependencies** — the constraint is Prisma plus the AWS S3
  client only.
- **Minimize image bloat and attack surface** — the same image also serves the
  live app; anything added to the runtime stage is exposed there too.
- **Keep local execution viable** — a developer must be able to run the export
  against a dev database and a test prefix (the acceptance check).
- **Low operational overhead** — avoid new build/publish pipelines and image
  lifecycles where possible.

## Considered Options

- Compile the export ahead of time into the app's build output and run the
  resulting plain-JavaScript artifact with the bare Node runtime.
- Ship the TypeScript source plus a TypeScript runtime in the runtime image and
  execute the source directly.
- Build and publish a separate, dedicated image for the export task.

## Decision Outcome

Chosen option: **compile the export ahead of time into the app's build output and
run the resulting plain-JavaScript artifact with the bare Node runtime**, because
it is the only option that satisfies every driver at once — it reuses the
existing image and the fixed command, adds no runtime dependencies, and adds only
a single inert bundled file to the runtime stage.

The bundling runs in the **build stage** using the bundler that already ships with
the toolchain, so it introduces no dependency into the runtime stage. The
generated Prisma client is inlined into the bundle, which resolves both the
missing-`src/` problem and the transitive-`pg` problem. The runtime stage gains
one self-contained JavaScript file, which is inert until the scheduled task
invokes it.

### Consequences

- Good, because the runtime image gains no new packages — the bundler is
  build-stage only — so the marginal attack surface over the app image is
  effectively nil.
- Good, because it keeps the drafted infra untouched: same image, same
  `pnpm run export:nlds` entrypoint, exit-code semantics preserved.
- Good, because inlining the generated client sidesteps the TypeScript-source and
  strict-`pg`-resolution problems without loosening pnpm's layout.
- Bad, because it adds a bundling step to the Docker build and a matching
  dev-only bundler dependency, which must be kept working as the build evolves.
- Bad, because the bundled artifact is a second build product to reason about; a
  Prisma-generator or schema change is only reflected after a rebuild.
- Neutral, because local runs bundle-then-execute (or use the interpreter path
  available in dev), a minor divergence from the container's execute-only step.

### Confirmation

Running the export against a dev database and a test prefix produces the expected
S3 objects and exits zero; a forced failure exits non-zero. In the built image,
the entrypoint resolves and executes with only the production dependency set
present (no TypeScript runtime, no `src/`).

## Pros and Cons of the Options

### Compile ahead of time into the build output; run plain JS

- Good, because no runtime dependency is added; the bundler is confined to the
  build stage.
- Good, because only one inert file is added to the runtime image.
- Good, because it reuses the fixed image and command with no infra change.
- Neutral, because local execution needs a bundle step (or the dev interpreter),
  a small workflow wrinkle.
- Bad, because it couples the export artifact to the Docker build and requires a
  rebuild to pick up schema/generator changes.

### Ship TypeScript source plus a TypeScript runtime in the image

- Good, because it is the least code to author and matches the existing seed
  workflow one-to-one.
- Bad, because it promotes a TypeScript interpreter (and `dotenv`) to runtime
  dependencies, directly violating the "Prisma + S3 client only" constraint.
- Bad, because it enlarges the runtime image and its attack surface, on an image
  that also serves the live app.
- Bad, because it requires copying additional source directories into the runtime
  stage.

### Separate dedicated image for the export

- Good, because it isolates the export's lifecycle from the app image.
- Bad, because it contradicts the already-drafted infra (which reuses the learner
  image) and forces a new registry repository, a second build-and-publish
  pipeline, and a task-definition image change.
- Bad, because it does not shrink the dependency set — the export needs the same
  Prisma engine, Postgres driver, and S3 client — so the same surface is simply
  rebuilt elsewhere.
- Neutral, because the isolation benefit only matters if the export later needs an
  independent release cadence, which is out of scope now.

## More Information

The dataset selection, output format, S3 key layout, and encryption requirements
are specified separately in the design spec that consumes this decision
(`docs/superpowers/specs/2026-07-01-nlds-export-design.md`). This ADR governs only
how the export is packaged and executed, not what it exports.
