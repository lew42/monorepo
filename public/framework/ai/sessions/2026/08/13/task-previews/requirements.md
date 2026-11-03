# task-previews — cards that say where a task is, at every tier

Mike, 2026-08-13: *"redesign these daily/task preview cards… each preview card
should show, as best it can, a summary of where it's at… we might want a
page.js that renders right in that task's dashboard, maybe even all the way up
at the daily page's preview of the task, and maybe all the way up at the
framework/ai/ page."* One of three Sonnet probes; each owns disjoint files.

## Deliverable

1. **A richer dashboard card** (`ext/ai/dashboard.js`, yours): keep the
   full-row, most-recent-first, pulse-while-running base, but make the card the
   best possible one-glance answer to "where is this task at?" — status, the
   `now` line or current agent, progress hints from the manifest (agents
   landed / dispatched, tokens, window cost), the tab chip. Study what exists
   before redesigning; small files, no grid of big cards (Mike rejected that).
2. **The page.js participation mechanism**: a task dir's own `page.js` should
   be able to contribute UI upward — its card on the day dashboard, and the
   day's presence on `/framework/ai/`. The site already has the machinery:
   `Page.preview(nav)` / `preview_card()` (core/Page/Page.class.js) and the
   day page's `children:`/`previews()`. Design the smallest bridge — e.g. the
   dashboard card adopts a declared child page's `preview()` override when one
   exists, else renders the manifest card. Document the tiers (ai index → day
   → task → sub) in your notes; `date/task/sub/page.js` is acceptable if
   whole-page override is cleaner. **Demo it in YOUR OWN task dir's page.js.**
3. Answer in `notes.md`: which session.json fields the CARD actually needs,
   vs what page-provided UI should own.

## Ownership

Yours: `ext/ai/dashboard.js`, `ext/ai/preview.css` (new, only if needed — own
stylesheet, full layer order), `framework/ai/page.js` and
`framework/ai/2026-08-13/page.js` (additive edits only — don't restructure,
don't touch the prose), this task dir (keep its `session.json` updated: `now`
as you go, `landed_at` + `outcome` when done), ONE numbered section at the END
of `ext/ai/readme.md`. NOT yours: `AISession.js`, `feed.*`, `replay/message/
prompt/stats.js`, `ai.css`, `core/`, the other 2026-08-13 task dirs.

## Rules

Read `.claude/skills/code-architecture/SKILL.md` first — binding (captor trap,
layer order, `classes:` forfeits `standard`, nested `.page` needs `default`).
Files ≤ ~120 lines. No commits, no npm, no server restarts (dev server on :80).
Verify: `node --check` via scratchpad `.mjs` copies; global-playwright pass on
`/framework/ai/2026-08-13/` and `/framework/ai/` — zero script errors, both
schemes, cards still sorted most-recent-first. Kill any processes you start.
