---
name: new-task
description: Open a task — create its ai/<date>/<slug>/ dir, open its task.jsonl log, and give it presence on the owner's dashboard. Run this BEFORE THE FIRST EDIT in ANY Claude session in this repo — building, changing, fixing, adding, refactoring, restyling, a doc pass, a rename, a demo, a bug fix — and when an agent embarks on a distinct sub-project. Also on "new task" / "start a task". Not needed to answer a question, read, investigate, or prepare — but the moment that turns into an edit, run it. Unsure? Run it.
---

# New task

Anything that changes the repo is a **task**: a dir at
`public/framework/ai/<YYYY-MM-DD>/<slug>/` whose append-only `task.jsonl` the day dashboard (`/framework/ai/<date>/`) renders live. Open it **before the first edit**. Format: `ext/JSONL/readme.md`; viewer: `ext/AITask/readme.md`.

If your brief names a task dir, Servex already opened it: log there and skip step 1.

## 1. Create the dir

- Slug: kebab-case, matching the VS Code tab title — `Get-Process Code -ErrorAction SilentlyContinue | Where-Object MainWindowTitle | Select-Object -ExpandProperty MainWindowTitle` lists the windows; yours matches this conversation's topic.
- ⚠ **Build it at an ABSOLUTE path**, or `cd` to the repo root in the same call. The Bash tool's
  cwd persists between calls, so an earlier `cd` into a module silently puts the whole task dir
  under it — `mkdir -p` cannot warn you, and a minion dispatched to read the brief finds nothing.
- ⚠ **A new day needs more than the dir.** `<date>/page.js` (clone yesterday's — `warm()`,
  `route()`, `dashboard(this)`) **and** the date added to `ai/page.js` `children:`, or the day
  404s and every task under it is invisible.
- `requirements.md` — the ask **verbatim**, plus scope and file-ownership fences if agents will run.
- ⚠ Scratch (probes, transcripts, intermediate JSON) goes in the session scratchpad, not the repo — and that
  scratchpad is **shared by every agent in the session**: name scripts after your task (`md-routes-probe.mjs`),
  or a sibling minion overwrites your `probe.mjs` mid-run (2026-08-18, it happened).
- `task.jsonl` — **at launch, not at the end**. One JSON object per line, one verb per key. Line one is an `assign` with the launch state:

```json
{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "<window label>", "group": "<the effort>", "request": "<the ask, verbatim>", "requested_at": "<ISO now, local offset>", "model": "<your model>", "window": {"before": <FRACTION of the 5h window used — percent / 100, e.g. 0.12>}, "now": "scoping", "steps": ["<step>", "<step>", …], "step": 1}}
```

**`group` is the effort** — the thread this belongs to, which outlives the day; reuse an existing slug (`ai-log`, `layout`, `panels`, `vision`, `apps`, `web-ui`), or omit it and the task files under *loose*. ⚠ **`session_id` is not optional** — without it the detail page has no transcript and renders no log at all.

**Append with the helper — it is what makes the encoding traps stop mattering.** `node .claude/hooks/append.mjs <target.jsonl> <lines.json>` appends the objects in a JSON array as one line each, turns every string value that is exactly `"NOW"` into the local clock at the moment of the append, sniffs the trailing newline, then re-parses the whole file and exits non-zero naming any bad line. Write `<lines.json>` with the **Write tool** — never a heredoc, never a shell string. That one route closes the BOM, ANSI-byte, em-dash and hand-typed-clock traps.

**What a line IS: one JSON object, one verb.** The verbs are `assign` `log` `action` `agent`
`chat` `shot` `ask` `decision` `verdict` `rank`; `log` is `{at, msg}`; an invented verb or key
renders as nothing at all, with no error. The schema — including `topic`, `needs` and `conclusion`
on an `ask` — is [`ext/JSONL/doc/task-jsonl.md`](/framework/ext/JSONL/doc/task-jsonl.md).
⚠ `note` is the one exception: it is `/framework/ai/v/2/`'s own board verb and renders as nothing
on any other task's log.

**`steps` — write the plan now, before the first edit.** `steps` is the outline (5–10 short steps, from `requirements.md`); `step` is the 1-based index of the one underway. The card's bar and checklist derive from those two fields.

**Keep state current as you go, so losing this session loses nothing.** When a step starts, append `{"assign": {"step": N, "now": "<what is happening inside it>"}}`. A fresh agent must be able to continue from the log plus the readme alone. Land with `step` at the last index.

- `../day.jsonl` — the DAY's log, `ai/<date>/day.jsonl`, beside your task dir (⚠ not the stale `ai/day.jsonl` one level up, which still looks current when tailed — a line went there 2026-08-29). Append one line, creating the file if the day is new:

```json
{"log": {"at": "<ISO>", "task": "<slug>", "msg": "task opened — <one line>"}}
```

## 2. Register + usage

- Leave the task dir **undeclared** — do NOT add it to the day page's `children:` unless the dir has its own `page.js` (a declared child skips the dynamic `route()` and 404s). The dashboard enumerates task dirs from `directory.json` either way.
- ⚠ **Check your brief's write fence before the next step.** If it does not name `ai/usage.json` and `ai/usage.jsonl`, SKIP the usage refresh entirely and log that you skipped it — the mastermind keeps the snapshot current. Two agents ran it past this caveat on 2026-09-19 and one then destroyed five days of samples trying to undo its own write ([`reset-recovery`](/framework/ai/2026-09-19/reset-recovery/)).
- Refresh the usage snapshot — **run this FIRST, before the launch line** (`window.before` is its `five_hour` percent DIVIDED BY 100 — the file says `2.0`, the line wants `0.02`; the divide happens here), then about every 15 minutes while working, never tighter (the endpoint 429s):

```bash
python "$USERPROFILE/.claude/bin/claude-usage.py" --json > public/framework/ai/usage.json
```

Each refresh, also append the snapshot to `public/framework/ai/usage.jsonl`:

```json
{"log": {"at": "<ISO>", "session": <pct>, "weekly_all": <pct>, "weekly_scoped": <pct>, "resets_at": "<five_hour.resets_at>"}}
```

⚠ **Append, never rewrite** — `usage.jsonl` is shared and append-only; a Write to it destroys every other agent's samples.

## 3. While working, log

Log milestones, not keystrokes; an append streams to the open tab (creating the task DIR full-reloads every tab). Decisions, caveats and measurements are written **when they happen**, not at the end:

- `{"decision": {"at": "<ISO>", "question": "…", "options": ["…"], "chose": "…", "why": "…"}}` — every fork in the road, alternative named.
- `{"log": {"at": "<ISO>", "msg": "…"}}` — a caveat, a finding, a verification result.
- `{"agent": {"kind": "agent|cli", "task": "…", "model": "…"}}` at dispatch; resend with the same `task` plus `outcome` when it lands. (Edits log themselves via a hook; token cost is written by Servex — never sum it by hand.)
- `{"assign": {"links": [{"url": "…", "label": "…"}]}}` as soon as an output is viewable; `assign` replaces the whole array, so resend it all.
- Wide work → the `fork-claude-session` skill; a spawned distinct project gets its own task dir with your `group`.

The detail lives here and in `doc/`; the page shows the thing, never the log.

### ⚠ A page nobody links to does not exist

**Nothing crawls the filesystem.** Before landing, every page this task created is linked from `links` **and** from somewhere a reader already is — its parent's `children:`, the page it is about, or the day page's `content()`.
Verify by loading the parent and clicking through, not by loading the page's own URL.

## 4. Land — with the `finish-task` skill

Improve this skill: append to `improvements.md`.
