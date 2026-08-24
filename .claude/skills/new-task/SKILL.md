---
name: new-task
description: Open a task — create its ai/<date>/<slug>/ dir, open its task.jsonl log, and give it presence on the owner's dashboard. Run this BEFORE THE FIRST EDIT in ANY Claude session in this repo — building, changing, fixing, adding, refactoring, restyling, a doc pass, a rename, a demo, a bug fix — and when an agent embarks on a distinct sub-project. Also on "new task" / "start a task". Not needed to answer a question, read, investigate, or prepare — but the moment that turns into an edit, run it. Unsure? Run it.
---

# New task

Anything that changes the repo is a **task**: a dir at
`public/framework/ai/<YYYY-MM-DD>/<slug>/` whose append-only `task.jsonl` the day dashboard (`/framework/ai/<date>/`) renders live. Open it **before the first edit**. Format: `ext/JSONL/readme.md`; viewer: `ext/AITask/readme.md`.

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

⚠ **Never write a `.jsonl`/`.json` with PowerShell's `Out-File`/`Set-Content -Encoding utf8`** — the BOM makes `TaskJSONL` silently drop line 1 (task never reaches Active) and `json.load` die; use the **Write tool**, append later lines with `Add-Content`. ⚠ And `Add-Content` writes ANSI: one non-ASCII character (an em dash) becomes an invalid byte and the viewer drops that whole line (bit 2026-08-21) — keep appends pure ASCII, or append via `[IO.File]::AppendAllText` with `[Text.UTF8Encoding]::new($false)`.

⚠ **Three ways a line is silently wrong.**
- **Timestamps come from the clock, never your head** — `date -Iseconds` (bash) or
  `Get-Date -Format 'yyyy-MM-ddTHH:mm:sszzz'`; both give the local offset. Typed values drift
  ahead of real time, and the day strip shows entries that had not happened yet.
- **The verbs are exactly** `assign` `log` `action` `agent` `chat` `shot`, and `log` is
  `{at, msg}`. An invented verb or key renders as nothing.
- **Escapes:** never backslash `$`, `<`, `>` or a backtick. Windows paths go in with forward
  slashes — through the Bash tool a doubled backslash arrives single, so a `C:\Users\…` path
  lands as `\U`, an invalid JSON escape, and the viewer drops the whole line.

**`steps` — the outline IS the progress bar.** `steps` is the proposal outline from `requirements.md`; `step` is the 1-based index of the one underway — the card's segmented bar, its `3/8` and the detail checklist all derive from those two fields, so nothing can disagree.
Aim for **5–10 steps**; bump `step` when one genuinely finishes, carrying a `now` line that says what's happening *inside* it.
Land with `step` at the last index; `landed_at` reads as all-checked whatever `step` says.

- `../day.jsonl` — append one line, creating the file if the day is new:

```json
{"log": {"at": "<ISO>", "task": "<slug>", "msg": "task opened — <one line>"}}
```

## 2. Register + usage

- Leave the task dir **undeclared** — do NOT add it to the day page's `children:` unless the dir has its own `page.js` (a declared child skips the dynamic `route()` and 404s). The dashboard enumerates task dirs from `directory.json` either way.
- Refresh the usage snapshot — **run this FIRST, before the launch line** (its `five_hour / 100` is `window.before`), then about every 15 minutes while working, never tighter (the endpoint 429s):

```bash
python "$USERPROFILE/.claude/bin/claude-usage.py" --json > public/framework/ai/usage.json
```

Each refresh, also append the snapshot to `public/framework/ai/usage.jsonl`:

```json
{"log": {"at": "<ISO>", "session": <pct>, "weekly_all": <pct>, "weekly_scoped": <pct>, "resets_at": "<five_hour.resets_at>"}}
```

## 3. While working, log — don't just narrate

⚠ **An append streams to the open tab over the socket (no reload); creating the task DIR full-reloads every tab that has read `directory.json`.** Log milestones, not keystrokes. (Verified 2026-08-18: `/framework/research/livereload/`.)

- `{"assign": {"now": "<one line>"}}` — whenever what-you're-doing changes; the card displays it.
- `{"log": {"at": "<ISO>", "msg": "…"}}` — findings, decisions, verification results.
- `{"action": {"at": "<ISO>", "did": "run", "files": ["…"]}}` — hand-write for `run` deeds ONLY; edits log themselves via the `PostToolUse` hook (absent a `hooks` key in `.claude/settings.json`, log them by hand as `did: "write|edit|run"`).
- `{"agent": {"kind": "agent|cli", "task": "<one line>", "model": "…"}}` at dispatch; resend with the same `task` plus `outcome`, `tokens`, `duration_ms` when it lands (TaskJSONL merges by `task`).
- `{"assign": {"links": [{"url": "…", "label": "…"}]}}` — as soon as an output is viewable, not at landing; `assign` replaces the whole array, so resend the full list.
- Wide work → the `fork-claude-session` skill; a spawned distinct project gets its own task dir with your `group`.

### ⚠ A page nobody links to does not exist

**Nothing crawls the filesystem.** Before landing, every page this task created is linked from `links` **and** from somewhere a reader already is — its parent's `children:`, the page it is about, or the day page's `content()`.
Verify by loading the parent and clicking through, not by loading the page's own URL.

## 4. Land — with the `finish-task` skill

Improve this skill: append to `improvements.md`.
