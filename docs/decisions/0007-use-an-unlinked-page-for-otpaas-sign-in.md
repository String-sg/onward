---
status: 'proposed'
date: 2026-10-19
decision-makers: santosral
consulted:
informed:
---

# Use an unlinked page for OTPaaS sign-in

## Context and Problem Statement

This ADR decides how SPED school staff get to OTPaaS sign-in, and whether existing learners see it on the login page. OTPaaS sign-in is emergency access for SPED school staff who don't have ICON or EduPass, and it accepts only allowlisted SPED school domains. Every signed-out request lands on the login page ("/login"), which offers only Google sign-in.

## Decision Drivers

- OTPaaS sign-in is emergency access for a small group, not a sign-in method for every learner.
- Existing learners do not see OTPaaS sign-in, because it accepts only allowlisted SPED school domains.
- The login page that ICON learners use does not change.
- SPED school staff can reach OTPaaS sign-in through their school.
- OTPaaS sign-in is easy to remove when EduPass replaces it ([#573](https://github.com/transformteamsg/onward/issues/573)).

## Considered Options

- A separate unlinked page
- A separate page linked from the login page
- One login page with both methods

## Decision Outcome

Chosen option: "A separate unlinked page", because only it keeps emergency access out of sight of existing learners. It also leaves the login page unchanged.

OTPaaS sign-in lives on its own page, with its own email step, PIN step, and messages. SPED schools receive the page URL and pass it to the staff who need it. Nothing on the login page leads to the new page. When the learner hooks redirect to sign in, they keep the requested page in the unauthenticated session. The new page returns the learner there after sign-in, and offers a way back to the login page.

### Consequences

- Good, because existing learners never see OTPaaS sign-in, so none of them try a method that rejects them.
- Good, because staff with both an ICON (`@moe.edu.sg`) and a SPED school email are less likely to create a second learning record.
- Good, because the login page and Google sign-in do not change at all.
- Good, because Google sign-in and OTPaaS sign-in stay on separate pages, each with its own errors and tests.
- Good, because removing OTPaaS sign-in later means deleting one page, with nothing to unpick from the login page.
- Bad, because signed-out SPED staff land on the Google-only login page, even after their session expires. They must open the OTPaaS page URL themselves.
- Bad, because the Onward team must give the page URL to every SPED school, and each school passes it to its staff.
- Bad, because SPED staff who open the URL after 15 minutes, or on another device, land on the home page, not the requested page.

### Confirmation

Review confirms that the login page does not change, and that Google sign-in behaves as before. Tests confirm that the new page is reachable without a session. Tests also confirm that a learner who opens the URL after a redirect, and signs in, reaches the page they first asked for.

## Pros and Cons of the Options

### A separate unlinked page

OTPaaS sign-in has its own page. Only SPED schools receive its URL, and the login page does not link to it.

- Good, because existing learners never see OTPaaS sign-in.
- Good, because the login page does not change at all.
- Bad, because a SPED staff member who reaches the login page cannot find their way to OTPaaS sign-in from there.

### A separate page linked from the login page

OTPaaS sign-in has its own page. The login page gains one link to it.

- Good, because SPED school staff can reach the page from the login page, including after a redirect or an expired session.
- Good, because the page is still easy to remove: delete one page and one link.
- Bad, because every existing learner sees a link to a method that accepts only allowlisted SPED school domains.
- Bad, because staff with both an ICON (`@moe.edu.sg`) and a SPED school email can find it, and create a second learning record.
- Bad, because it changes the login page that ICON learners use.

### One login page with both methods

The login page shows the Google button and an email field.

- Good, because every learner starts on one page, and every redirect reaches both methods.
- Bad, because every existing learner sees an email field that rejects most of them.
- Bad, because it changes the login page that ICON learners use.
- Bad, because removing OTPaaS sign-in later means unpicking a shared page.
