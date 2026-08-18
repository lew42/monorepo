# Screenshots in the AI task log

Mike, 2026-08-17, verbatim:

> i think we need to bring back screenshot analysis to our system.
>
> however, I want to see feedback for these screenshots. can we get screenshots
> into the AI task log? if a task generates 100 images, I want to see them. But
> we don't want them in the repo. if we can pull them into the UI by simply
> processing the session log, maybe that's enough? or maybe the layout-design
> tool should instruct to take screenshots, and log their location into the task
> log?

**Build exactly that, and nothing more.** This task is the *plumbing* — get images
taken outside the repo to appear in the dashboard, keyed off the task log. The
scoring layer that will ride on top is a separate, later task; your job is to make
it possible, not to build it.

## The shape

1. **A log-line convention.** A worker that takes a screenshot appends one line
   to its own `task.jsonl` recording where the image is and what it is *of*.
   Design the line and **document it in `ext/JSONL/readme.md`** alongside the
   existing types. It needs at minimum: the absolute path, the url shot, the
   viewport width, and a human label. Leave obvious room for scores to be added
   later without changing the line's shape — Mike wants layout/contrast/density
   ratings attached to these images next.
2. **A dev-only route that serves them.** The images live in the session
   scratchpad, never in the repo (RULE#12), so the dashboard can't reach them as
   static assets.
3. **Dashboard rendering.** The task log view shows the images inline — a wall of
   thumbnails, clickable to full size. *"if a task generates 100 images, I want to
   see them"*: 100 thumbnails must stay usable, so lazy-load and don't fetch full
   resolution for a thumbnail.

## Two hard constraints — read these before writing the route

**⚠ Serving files from outside `public/` is exactly the hole that was open on
this server until today.** `GET /ai-logs/:id` streamed `~/.claude/projects/`
transcripts to the whole LAN behind nothing but a UUID-shaped id. It is now fixed.
**Your route must be born with the same guard**, not have one added later:

- Reuse `loopback()` from `Server/plugins/MCP.js`. Do not write a new check, and
  do not gate on `Origin` alone — only a browser is obliged to send one, and any
  other client omits it or forges `http://localhost`. The peer address is the one
  field a caller cannot choose.
- **Confine the served paths.** Resolve the requested path and verify it sits
  inside the permitted screenshot root *after* resolution — `..` traversal and
  symlinks both defeat a prefix check done before `path.resolve`. Serve image
  types only.
- Verify it yourself: loopback gets the image, a caller from this machine's LAN
  address gets **403**, and a `..` traversal attempt gets refused. Log the three
  results. See `Server/README.md` for how the two existing guards are recorded,
  and add yours the same way.

**⚠ LAW#2 — static compatibility.** Production is pure static hosting; nothing may
depend on server-side logic at runtime. The dashboard is dev-facing, so the
screenshot wall must **degrade gracefully when the route isn't there**: no thrown
errors, no broken-image grid, no hanging spinner on the static deploy. Decide what
absent images should look like and make that the honest default.

**⚠ Do not restart the dev server on port 80** — other sessions are on it. Test on
a throwaway port, the way the `ai-logs-guard` task did. Note in your log that the
route needs a restart to go live.

## Answer one design question explicitly

Mike offers two mechanisms: *"pull them into the UI by simply processing the
session log"* **or** *"the layout-design tool should instruct to take screenshots,
and log their location into the task log."*

These aren't equivalent. Scraping the raw session transcript finds images nobody
deliberately logged, but couples the dashboard to a transcript format we don't
own. An explicit log line is a stable contract but only captures what a worker
remembered to record. **Pick one, state why in one sentence, and note what the
other would have bought.** Prefer the simpler mechanism — MINIMIZE THE CHAOS
(CLAUDE.md RULE#18): this should be a small amount of obvious code, not a
pipeline.

## Files you own

- `Server/plugins/**` — a new plugin, plus `Server/README.md` for the guard record.
- `public/framework/ext/JSONL/**` — the log-line type and its readme.
- `public/framework/ext/AITask/**` — the dashboard rendering.
- `public/framework/ai/2026-08-17/shots-in-log/**` — your task dir.
- `public/framework/ai/usage.json`, `public/framework/ai/2026-08-17/day.jsonl` —
  the `new-task` skill's own writes, permitted.

**Fenced off:** `styles/layouts/**` (two other agents are in there),
`ext/LayoutTool/**` (frozen), `ext/Panel/**` (another session). Read-only
everywhere else.

## Deliverables, in this order

1. **A working end-to-end demonstration**: take a handful of real screenshots of
   real pages, log them, and show them rendering in the dashboard. Log the
   dashboard url so Mike can click it.
2. The three guard verification results (loopback 200, LAN 403, traversal
   refused).
3. The convention documented in `ext/JSONL/readme.md`.
4. The graceful-degradation behaviour, stated and verified.

Running short? Cut 3 last — but **never ship the route without 2.** An unguarded
route reading outside `public/` is the bug we spent today closing.

Log your findings as `log` lines in your own `task.jsonl`, not a `findings.md` —
the harness blocks subagents writing report files.

## Working notes

- **Foreground is the default.** If you background a command, poll it:
  `while (-not (Test-Path out.json)) { Start-Sleep 15 }`
- LAW#4: **no npm dependencies**, devDependencies included. Playwright is
  installed globally. The three-package list (`chokidar`, `express`, `ws`) is a
  feature.
- LAW#1/LAW#3: no build step; import paths are real URLs — root-absolute or
  relative with an explicit `.js`. No bare specifiers.
- RULE#11: most files under 100 lines. RULE#9: comments near zero, except a trap
  or constraint the code can't show — the guard's reasoning **is** such a trap, so
  one sentence there earns its place.
- Check usage before wide work.
