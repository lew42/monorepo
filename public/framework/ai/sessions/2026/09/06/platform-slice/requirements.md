# platform-slice — the first vertical slice runs end to end, locally (Opus)

Three laws: less is more (ASAP) — the fastest working version first; clear beats brief, by far; prioritize. Length budget: the report is 10 plain lines; the summary page is one screen.

Read first: the repo's `CLAUDE.md`; `../../2026-09-04/mastermind-platform/minion-rules.md`; the platform hub `/imagine/platform/` (`public/imagine/platform/page.js` and its "Where this stands"); the decision records `public/imagine/platform/decisions/*.md`; the slice definition `public/imagine/platform/mvp/page.js`; the local harness `worker/` (`index.js`, `dev.js`, `dev.mjs` at the root, `schema.sql`, `seed.sql`, `session.js`, `me.js`, `room.js`, `can.js`) and `wrangler.dev.jsonc`. The original brief is `../../2026-09-04/mastermind-platform/requirements.md` §1–§35 — every implementation idea in it is a hypothesis, and the decision records are what was decided. Skills: `new-task` (this dir, group `platform`), `code`, `finish-task`.

## The job

Make the smallest vertical slice run end to end on the local Cloudflare harness: **one topic world, one page inside it, one signed-in user, one like.** The mvp page defines the slice; if it says something narrower or different from those four nouns, the page wins, and you say so in your first log line. Find what already runs (the worker has session, me, room and can modules — some of this may be done; prove which parts by running them, not by reading), then build what is missing, in the order that gets a browser to show the whole path soonest.

## Deliverables

1. The slice runs: a written recipe in `run.md` (this dir) that a cold reader follows from a fresh terminal to a browser showing the four nouns working — the exact commands, the private port, what they should see. You ran it yourself, start to finish, and the log says so with the time it took.
2. `/imagine/platform/mvp/` shows it: the page gains a "Running" section — one screen, shown not told: a screenshot of the working path, the recipe link, and one sentence per noun saying what is real and what is faked (an in-memory session is faked; a D1 row is real).
3. The hub's "Where this stands" updated in one sentence with a link.
4. A decision record `public/imagine/platform/decisions/slice.md` for any call you had to make that the existing records do not cover — the §33 shape the other records use.

## Rules

- **Never write a secret** anywhere — no keys in files, logs, or the recipe; local-only config.
- `wrangler.jsonc` is untouched; `wrangler.dev.jsonc` is yours. No deploy. No new npm dependency (`npx wrangler` is fine).
- Ports: the harness on a private port you choose in the 8200s; the dev server, if you need the site, `PORT=8097 node server.js`; kill the pids you started; never port 80; never the owner's tabs.
- Never `find /`; never spawn agents; never `git stash`/commit.

## Fences and budget

Write `worker/**`, `wrangler.dev.jsonc`, `dev.mjs`, `public/imagine/platform/**`, this task dir. Nothing else. Budget ~400k tokens. Report in ≤ 10 plain lines: what runs (the four nouns, real or faked each), the recipe's first command, what you found already working, what you decided, what is left.
