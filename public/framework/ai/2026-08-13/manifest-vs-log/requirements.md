# manifest-vs-log — what the file should say vs what the transcript already knows

Mike, 2026-08-13: *"consider what kind of session.json data could/should go
into that file, vs what can be pulled from the full log? if i want to build out
some proposal + logging + tracking UI, what kind of improvements can be made to
the log rendering?"* One of three Sonnet probes; each owns disjoint files.

## Deliverable

1. **`analysis.md` in this task dir** — the design document, verdict-first:
   - Field-by-field: what is *authoritative manifest data* (things the
     transcript cannot know or should not be re-derived: the ask verbatim, tab,
     group, human decisions, window before/after) vs *derivable* (tokens via
     deduped `message.usage`, timelines, agent rosters from Task tool calls,
     current activity from the tail). Read the schema + its "Bites" section in
     `ext/ai/readme.md` first — fork-copied history double-counts, one
     response spans several lines (dedupe by `message.id`).
   - A schema-v2 proposal, weighted per verdict-firmness (state reasoning).
   - Prioritized, concrete log-rendering improvements for a proposal +
     logging + tracking UI.
2. **Working derivation code** in `ext/ai/stats.js` (yours): pure functions
   over parsed JSONL lines — `usage_of(lines)` (deduped token totals),
   `tail_activity(lines)` (the latest meaningful action as a one-line "now"
   string), `timeline_of(lines)` (prompt boundaries with timestamps). No DOM
   in these — they must be adoptable by the dashboard later.
3. **A demo `page.js` in this task dir**: fetch the real transcript
   (`/ai-logs/<uuid>` — take the uuid from `../sessions/session.json`; fetch +
   SPA-html-sniff pattern is in `replay.js` `load()`) and render your three
   functions' outputs live.

## Ownership

Yours: `ext/ai/stats.js` (extend — keep the existing exports `clock/elapsed/
count/dur/ref` untouched; they have importers), this task dir (keep its
`session.json` updated: `now` as you go, `landed_at` + `outcome` when done),
ONE numbered section at the END of `ext/ai/readme.md`. NOT yours:
`AISession.js`, `dashboard.js`, `feed.*`, `replay/message/prompt.js`,
`ai.css`, the other 2026-08-13 task dirs, `Server/`.

## Rules

Read `.claude/skills/code-architecture/SKILL.md` first — binding. Files ≤ ~120
lines (analysis.md may run longer — it is the deliverable). No commits, no
npm, no server restarts (dev server on :80). Verify: `node --check` via
scratchpad `.mjs` copies; browser pass on your own task page — zero script
errors. Kill any processes you start.
