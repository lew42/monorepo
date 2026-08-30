# Audit fixes (W3b) — crash, six orienting lines, Panel-400

## The ask (verbatim)

> TASK W3b — three targeted fixes from the site audit
> (`public/framework/ai/2026-08-30/site-audit/task.jsonl` has the details + shots). First:
> run `new-task` (slug `audit-fixes`, group `pages`).
>
> 1. **The crash**: `/framework/ai/2026-08-08/` blanks with "Page Load Error" — a
> `regions.forEach` bug (likely legacy session.json rendering in ext/AITask for old-format
> days). DIAGNOSE at the cause: does it hit other old days too (spot-check 08-09 through
> 08-12)? Fix so old days render (a guard where regions is absent is fine if that's the
> honest shape of old data — say which).
>
> 2. **Six missing orienting lines**: the audit found `/framework/ai/`,
> `/framework/ext/Playground/`, `/notes/auth/` + 3 more (its json lists them; `/notes/auth/`
> also needs a way OUT — nav links, it's a dead-end leaf). One sentence under the title
> saying what the page is; a nav affordance where absent. ⚠ ext/Playground's PAGE.js only —
> do not touch the Playground app code (another session's).
>
> 3. **Panel demo at 400**: `/framework/ext/Panel/`'s demo renders near-empty at 400 (audit
> shot 15). Diagnose: does the demo need a smaller default tree at narrow widths, a min, or
> does the box collapse? Fix the presentation of THAT demo only — do not touch ext/Panel
> internals.
>
> FENCE — ext/AITask/** (the crash), the six pages' page.js, ext/Panel's root page.js demo
> config only. Nothing else.
>
> VERIFY: 2026-08-08 renders (before/after shot), the six pages show their line + nav at
> 400/1920, Panel demo shows content at 400 (before/after), zero console errors, other ai/
> days unregressed (crawl all day pages). Keepers + `links`. Report: the crash cause in one
> line, pages fixed (N), Panel diagnosis, cuts.

## What the audit's json actually named (worked out from audit.json + worst-20 shots)

- **Crash**: NOT ext/AITask — `public/framework/ai/2026-08-08/page.js` calls the shared
  `styles/layouts/preview.js` with a stale 4-arg signature (`name, classes, regions,
  column`) against the current 3-arg `shape(classes, regions, column)`. The name string
  lands in `classes`, the real regions array lands in `column`, and `regions.forEach` runs
  on whatever 3-word class string was passed. Spot-checked 08-09..08-12 (and every other
  `ai/` day, 18 total): all clean, this is the only broken day.
- **Six pages** (a=0 "no title+line" or b=0 "no nav", from audit.json's per-width grades):
  `/framework/ai/` + `/framework/ai/intro/` (one file, `ai/page.js` — `intro` is the child
  `catalog()` synthesizes from `content()`, which the page never defined), `
  /framework/ext/Playground/` (render() bypasses Page's chrome entirely — no `<h1>` at
  all), and the three `/notes/` dead-end leaves — `auth`, `git-branch-names`, `team-note`
  (each has its line, none has a way out).
- **Panel demo**: the box does not collapse and needs no smaller default tree — `content()`
  calls `dock()` unconditionally at load, and `drawer.css`'s own documented contract turns
  the rail into a full-screen overlay below 26rem (`there is no room to push ... the rail
  becomes the whole sheet instead`). At 400 the empty "nothing selected" rail buries the
  live workspace completely before the reader ever sees it.

## Fence

`ext/AITask/**` was the guessed location for the crash; the real bug is
`framework/ai/2026-08-08/page.js` (a day's own page, not ext/AITask) — fixed there instead,
single call-site fix, nothing shared touched. Otherwise as given: the six pages' `page.js`
only (`framework/ai/page.js`, `framework/ext/Playground/page.js`, `notes/auth/page.js`,
`notes/git-branch-names/page.js`, `notes/team-note/page.js`), and `ext/Panel/page.js`'s
demo config only.

## Rules

Never kill/restart :80 (down — private `$env:PORT='8096'` node server, torn down after).
Never drive owner tabs. No stash, no commit. Screenshots to the scratchpad; keepers here.
