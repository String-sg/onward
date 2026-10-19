---
status: 'proposed'
date: 2026-10-19
decision-makers: santosral
consulted:
informed:
---

# Store OTPaaS learners in the User table with an optional name and Google ID

## Context and Problem Statement

Learners who sign in through OTPaaS (OTPaaS learners) have no name and no Google ID, and the `User` table requires both. This ADR decides how Onward stores them.

SPED school staff without an iCON account will sign in with a one-time PIN sent to their school email ([#671](https://github.com/transformteamsg/onward/issues/671)). OTPaaS confirms only that the learner controls the mailbox: a successful verification returns the email address and nothing else. Today every learner signs in with Google, which always provides a name and a Google ID, so `User.name` and `User.googleProviderId` are both required.

The learner's records hang off `User`: their profile, learning journeys, chat threads, and sentiments. OTPaaS learners need the same records as Google learners.

OTPaaS sign-in is interim. Once every SPED school is on EduPass ([#573](https://github.com/transformteamsg/onward/issues/573)), Onward moves to EduPass and retires both iCON and OTPaaS sign-in.

## Decision Drivers

- OTPaaS learners need the same learning records as Google learners, and every learning record relates to `User`.
- OTPaaS returns only a verified email address.
- Google sign-in must not change.
- Stored values must be true. The NLDS warehouse receives the whole database ([ADR-0005](./0005-glow-nlds-warehouse-connector.md)), so an invented value becomes a reported fact.
- OTPaaS sign-in is interim, so a small change that EduPass can replace is preferred.

## Considered Options

- Optional name and Google ID on `User`
- A separate sign-in identity table
- Placeholder values in the required columns
- A separate table for OTPaaS learners

## Decision Outcome

Chosen option: "Optional name and Google ID on `User`", because it is the only option that meets three drivers. It keeps one learner table, stores no invented values, and leaves Google sign-in unchanged.

An OTPaaS learner is a `User` row with an email and neither a name nor a Google ID. The email identifies them, as it is already unique. A Google learner keeps both values, because Google sign-in still requires them.

### Consequences

- Good, because every learning record keeps its existing relation to `User`, so no relation or query changes.
- Good, because Google sign-in and existing rows are unchanged. Postgres allows more than one missing value in a unique column, so the Google ID stays unique among Google learners.
- Good, because a missing value is stored as missing. The NLDS warehouse and the admin reports see no invented names or IDs.
- Good, because the change is two columns. The EduPass migration can replace it without unpicking a new table.
- Bad, because every place that reads a learner's name must handle a missing one. This covers the profile, greetings, the avatar initial, and the admin reports and exports.
- Bad, because the admin reports sort by name, and a missing name breaks a sort that relies on name alone. They need a stable second sort key.
- Bad, because a staff member with both an iCON account and a SPED school email gets two learner records. [#671](https://github.com/transformteamsg/onward/issues/671) accepts this for the interim.
- Neutral, because an OTPaaS sign-in with an email that a Google learner already holds reaches that same account. Both sign-in methods prove control of the same mailbox, so they are treated as one learner.
- Neutral, because the NLDS warehouse load must accept a missing name and Google ID. Product Ops confirm this before the change deploys.

### Confirmation

Review of the schema migration confirms that only `User.name` and `User.googleProviderId` become optional. Review also confirms that no code writes a placeholder value. Tests confirm that Google sign-in still stores both values. Tests also confirm that the admin reports and exports list each learner with no name exactly once. [#673](https://github.com/transformteamsg/onward/issues/673) carries these checks.

## Pros and Cons of the Options

### Optional name and Google ID on `User`

`User.name` and `User.googleProviderId` become optional. Nothing else in the schema changes.

- Good, because one table holds every learner, whatever sign-in they use.
- Good, because existing rows, relations, and Google sign-in are unchanged.
- Good, because it stores only true values.
- Neutral, because the schema no longer shows how a learner signed in. A learner with no Google ID signed in through OTPaaS.
- Bad, because every reader of the name must handle a missing value.

### A separate sign-in identity table

A new table holds one row per sign-in method, linked to `User`. The Google ID moves into it, and an OTPaaS learner gets an email identity row.

- Good, because it supports more sign-in methods without new columns on `User`.
- Good, because it can link one learner to several sign-in methods.
- Neutral, because the name still has no source for OTPaaS learners, so it must become optional anyway.
- Bad, because it moves every existing Google ID and adds a join to every Google sign-in.
- Bad, because it builds lasting structure for an interim method. EduPass replaces both sign-in methods, and its own identity model decides what lasts.

### Placeholder values in the required columns

Both columns stay required. OTPaaS learners get a generated name, such as the email's local part, and a synthetic Google ID, such as one prefixed with `otp:`.

- Good, because the schema does not change and no reader needs to handle a missing value.
- Bad, because a column named for Google holds values that Google never issued.
- Bad, because a generated name looks like a real name, so the profile and greetings show it as one.
- Bad, because the NLDS warehouse and the admin reports receive invented values as fact.
- Bad, because code can tell a real value from a placeholder only by inspecting the string.

### A separate table for OTPaaS learners

OTPaaS learners live in their own table, with only an email.

- Good, because `User` keeps both columns required.
- Bad, because every learning record relates to `User`, so each relation must be duplicated or made to point at either table.
- Bad, because every learner query and report must combine two tables.
- Bad, because it is the largest change, for a sign-in method that EduPass retires.

## More Information

- [#671](https://github.com/transformteamsg/onward/issues/671): OTPaaS sign-in for SPED school staff, including the SPED school domain allowlist and what is out of scope.
- [#673](https://github.com/transformteamsg/onward/issues/673): the schema change and the code that handles a missing name.
- [#573](https://github.com/transformteamsg/onward/issues/573): the EduPass integration. Revisit this decision when EduPass replaces iCON and OTPaaS sign-in, as the identity model is redesigned then.
- [#603](https://github.com/transformteamsg/onward/issues/603) and [#604](https://github.com/transformteamsg/onward/issues/604): an earlier sign-in change for a custom domain, with identity mapping deferred to the EduPass migration.
- The choice of OTPaaS as the OTP provider is recorded in a separate ADR.
