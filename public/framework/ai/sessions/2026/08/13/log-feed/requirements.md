# log-feed — the task page as a live feed

Mike, 2026-08-13: *"when clicking into it [a task], display the log in reverse
chronological order, so new comments appear at the top, and don't collapse it.
This could become a socket feed."* This is one of three Sonnet capability
probes; each owns disjoint files.

## Deliverable

`ext/ai/feed.js` (+ its own `feed.css`) — `feed(session_id)`: the transcript
rendered **newest-first, expanded, no fold-bars** — a feed, not an archive.
Integrate it into `AISession.report()` where the nested replays currently sit
(the feed becomes the task page's default log view; whether `replay()` stays
available beneath it is your call — record it).

- Reuse the parsing that exists: `replay.js`'s `load()` shows the fetch +
  SPA-html sniff; `prompt.js` (`parse`, `command`, `harness`, `trivial`) and
  `message.js` (`message`) do the heavy lifting; `stats.js` has `clock/dur/ref`.
  Import — do not duplicate.
- A turn = the prompt plus its flow (thinking, tool calls, response). Render
  turn blocks newest-first; within a turn keep natural reading order.
  Timestamps visible. Harness noise (system-reminders, command echoes) stays
  parsed out or folded — signal only.
- **Socket-ready seam:** structure so a pushed line can prepend without a full
  re-render (one function appends/prepends a parsed line). For now: a refresh
  control + optional localhost-only polling (~5s, page-visible only). Document
  the socket seam in your notes — do NOT touch `framework/dev/Socket` or the
  server.
- Test against the real transcript: the uuid in
  `../sessions/session.json` served at `/ai-logs/<uuid>`.

## Ownership

Yours: `ext/ai/feed.js`, `ext/ai/feed.css`, `ext/ai/AISession.js` (the report()
integration only), this task dir (including updating `session.json` here — set
`now` as you go, `landed_at` + `outcome` when done), ONE numbered section
appended at the END of `ext/ai/readme.md`. NOT yours: `dashboard.js`,
`replay.js`, `message.js`, `prompt.js`, `stats.js`, `ai.css`, the other
2026-08-13 task dirs, anything outside `ext/ai/` + this dir.

## Rules

Read `.claude/skills/code-architecture/SKILL.md` first — binding (captor trap;
`@layer base, theme, site, util;` restated in full in feed.css; every rule in a
layer; no backticks inside css template literals). Files ≤ ~120 lines. Comments
near zero. No commits, no npm, no server restarts (dev server runs on :80).
Verify: `node --check` via `.mjs` copies in the scratchpad (never the repo);
global-playwright browser pass on `/framework/ai/2026-08-13/sessions/` — zero
script errors, both color schemes. Kill any processes you start.
