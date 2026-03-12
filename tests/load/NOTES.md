# Load Test

Simulates a learner browsing and completing a Learning Unit.

## Scenarios: Complete a Learning Unit

Each virtual user runs through the following flow:

| Step | Action                                            | Think time |
| ---- | ------------------------------------------------- | ---------- |
| 1    | Browse `/home`                                    | 3s         |
| 2    | Browse `/todos`                                   | 3s         |
| 3    | Browse `/bites`                                   | 3s         |
| 4    | Open a Learning Unit page (captures `csrfToken`)  | 5s         |
| 5    | Stream the first chunk of the podcast audio       | —          |
| 6    | POST a learning journey checkpoint at 10s         | 10s        |
| 7    | Wait for the ~5 min podcast to finish             | 290s       |
| 8    | POST to unlock the quiz (`updateQuizAttempt`)     | —          |
| 9    | Open the quiz page                                | 300s       |
| 10   | POST quiz completion (`updateLJCompletionStatus`) | —          |

## Load Phases

| Phase          | Duration | Rate      |
| -------------- | -------- | --------- |
| Warm up        | 10s      | 1 VU      |
| Ramp up        | 2m       | 1 → 3 VUs |
| Sustained load | 15m      | 3 VUs     |

**Why these numbers:**

- **Warm up** — lets the server settle before real load hits.
- **Ramp up** — slowly increases users so you can see where things start to degrade.
- **Sustained load** — keeps pressure on long enough to catch issues that only show up over time.

**How to calculate arrival rate:**

```
arrival rate = peak hour users / 3600
```

1. **Estimate peak hour users** — how many unique users do you expect in your busiest hour? A reasonable estimate is 5%-20% of total users.
   - e.g. 40,000 × 5% = 2000 peak hour users
2. **Divide by 3600 seconds (1 hour)** — `2000 / 3600 = 0.56 users`.
3. **Apply a stress multiplier** — multiply to test beyond expected load.
   - e.g. 0.56 × 3 = 1.68 users

## Setup

Before running, fill in the placeholders in `load-test.yml`:

### `config.target` and `Origin` header

Set both to the base URL of the environment you're testing against.

### Cookies

Log in via browser, then grab the cookies from DevTools (Application → Cookies):

- `learner.session` — session token
- `learner.csrf` — CSRF token

### Variables

- `unitId` — ID of a published Learning Unit (find it in the URL: `/unit/<id>`)
- `podcastKey` — S3/MinIO key of that unit's podcast audio file

## Running

```sh
# Run against the default target
pnpm load:test
```
