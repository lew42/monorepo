---
name: new-task
description: Open a task — create its folder with node Server/TaskDirs.mjs --new <slug>, open its task.jsonl log, and give it presence on the owner's dashboard. Run this BEFORE THE FIRST EDIT in ANY Claude session in this repo — building, changing, fixing, adding, refactoring, restyling, a doc pass, a rename, a demo, a bug fix — and when an agent embarks on a distinct sub-project. Also on "new task" / "start a task". Not needed to answer a question, read, investigate, or prepare — but the moment that turns into an edit, run it. Unsure? Run it.
---

# New task

Anything that changes the repo is a **task**: a folder inside your session's folder in the sessions store,
`public/framework/ai/sessions/YYYY/MM/DD/<session>/<slug>/`, whose append-only `task.jsonl` the board renders live. **Never type the path:** `node Server/TaskDirs.mjs --new <slug>` makes it and prints it (your session id comes from `$CLAUDE_CODE_SESSION_ID`; a child task: add `--parent <parent dir>`). A task is made and changed through the **item tool**, not by hand-writing JSON: `item({path, delta})`. A child is one call on its parent: `item({path: "<parent>", delta: {"tasks": {"add": {"title": "…", "expected": "…"}}}})`. Its home is `<module>/tasks/<slug>/`, or the parent's folder when there is no module. Detail: [core/Task](/framework/core/Task/). Why the folders: [`ai/doc/task-folders.md`](/framework/ai/doc/task-folders.md). The old flat `ai/<YYYY-MM-DD>/` day folders are retired; an old path still works for appends (`append.mjs` follows it). Open it **before the first edit**. Format: `ext/JSONL/readme.md`; viewer: `ai/AITask/readme.md`.

**Where a new file goes** (the owner, 2026-10-13: "creating a new file, what its name is and what goes in it" are the most important questions): a file about a module lives in that module's folder; a record lives in the store at its date path (`ai/sessions/YYYY/MM/DD/…`, made by `TaskDirs`); nothing else is created under `ai/`. A path the old way (`ai/<YYYY-MM-DD>/`) is refused by `append.mjs`.

If your brief names a task dir, Servex already opened it: log there and skip step 1. Which tool makes a task for whom (SDK agent, VS Code tab, cloud voice agent with `--parent <its session dir>`): [ai/doc/tasks.md](/framework/ai/doc/tasks.md).

## 1. Create the dir

- Slug: kebab-case, matching the VS Code tab title — `Get-Process Code -ErrorAction SilentlyContinue | Where-Object MainWindowTitle | Select-Object -ExpandProperty MainWindowTitle` lists the windows; yours matches this conversation's topic.
- ⚠ **Run it from the repo root** (`cd` to it in the same call). The Bash tool's
  cwd persists between calls, so an earlier `cd` into a module silently puts the whole task dir
  under it — `mkdir -p` cannot warn you, and a minion dispatched to read the brief finds nothing.
- `requirements.md` — the ask **verbatim**, plus scope and file-ownership fences if agents will run.
- **A brief made from dictation is made with `refine.mjs`, not by hand-summarizing.** If the request started as a long spoken or typed dictation, run `node Server/refine.mjs <raw.txt | date:line> --out <task dir>/runs/<name>` first — it turns the raw talking into a checked `brief.md`, and its `coverage.md` proves nothing important was silently dropped or turned into a stricter rule on the way. Use `brief.md`'s numbered asks as `requirements.md`'s own content, and keep `coverage.md` sitting right beside `requirements.md` (`Server/doc/refine.md`).
- ⚠ Scratch (probes, transcripts, intermediate JSON) goes in the session scratchpad, not the repo — and that
  scratchpad is **shared by every agent in the session**: name scripts after your task (`md-routes-probe.mjs`),
  or a sibling minion overwrites your `probe.mjs` mid-run (2026-08-18, it happened).
- `task.jsonl` — **at launch, not at the end**. One JSON object per line, one verb per key. Line one is an `assign` with the launch state:

```json
{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "<window label>", "group": "<the effort>", "request": "<the ask, verbatim>", "requested_at": "<ISO now, local offset>", "model": "<your model>", "window": {"before": <FRACTION of the 5h window used — percent / 100, e.g. 0.12>}, "now": "scoping", "steps": ["<step>", "<step>", …], "step": 1}}
```

**`group` is the effort** — the thread this belongs to, which outlives the day; reuse an existing slug (`ai-log`, `layout`, `panels`, `vision`, `apps`, `web-ui`), or omit it and the task files under *loose*. ⚠ **`session_id` is not optional** (the launch line keeps that name: Servex reads it; `Task.session` reads either) — without it the detail page has no transcript and renders no log at all.

**Append with the helper — it is what makes the encoding traps stop mattering.** `node .claude/hooks/append.mjs <target.jsonl> <lines.json>` appends the objects in a JSON array as one line each, turns every string value that is exactly `"NOW"` into the local clock at the moment of the append, sniffs the trailing newline, then re-parses the whole file and exits non-zero naming any bad line. Write `<lines.json>` with the **Write tool** — never a heredoc, never a shell string. That one route closes the BOM, ANSI-byte, em-dash and hand-typed-clock traps.

**What a line IS: one JSON object, one verb.** The verbs are `assign` `log` `action` `agent`
`chat` `shot` `ask` `decision` `verdict` `rank` `experiment` `review`; `log` is `{at, msg}`. `append.mjs` refuses an
invented verb, a flat line or a missing field, and prints the right shape: the list is [`.claude/hooks/jsonl-schema.mjs`](../../hooks/jsonl-schema.mjs). The schema — including `topic`, `needs` and `conclusion`
on an `ask` — is [`ext/JSONL/doc/task-jsonl.md`](/framework/ext/JSONL/doc/task-jsonl.md).
⚠ `note` is the one exception: it is `/framework/ai/v/2/`'s own board verb and renders as nothing
on any other task's log.

**The plan is child tasks, written now, before the first edit.** Add 5–10 short steps from `requirements.md` as `tasks` of the task (one `item` call each, the grouping rule in [core/Task](/framework/core/Task/)). No new task writes `steps`; old folders with `steps` still read.

**Keep state current as you go, so losing this session loses nothing.** When a step starts, call `item({path: "<step>", delta: {"start": {}}})` and set its line with `{"now": "<what is happening inside it>"}`. A fresh agent must be able to continue from the log plus the readme alone. A finished step is `{"complete": {}}`.

- `day.jsonl` — the DAY's log, in the day's folder of the store (`node Server/TaskDirs.mjs --day` prints it, e.g. `public/framework/ai/sessions/2026/10/12`; ⚠ not the stale `ai/day.jsonl`). Same route as your task log — `node .claude/hooks/append.mjs <day dir>/day.jsonl <lines.json>`:

```json
{"log": {"at": "<ISO>", "task": "<slug>", "msg": "task opened — <one line>"}}
```

### Past work and a plan, before you build (suggested)

Run the `past-work` skill on your topic first (`node Server/PastWork.mjs <topic>`; the site-wide list is [`ai/past-work-index.md`](/framework/ai/past-work-index.md)), so you extend what exists instead of rebuilding it. Then investigate: how it works now, the relevant pieces, the decisions to make. Write that as `plan.md` beside `requirements.md`, and build from it. A tiny task needs three lines, not a document.

## 2. Register + usage

- Leave the task dir **undeclared**: the sessions store routes every folder by its path (`/framework/ai/sessions/YYYY/MM/DD/<session>/<slug>/`), and the board lists tasks with `TaskDirs.list()`.
- `window.before` is the 5-hour fraction from `node Server/usage-now.mjs` (it prints a percent; divide by 100). Never run the usage script or write `usage.json` yourself: Servex refreshes it every 15 minutes.

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

**Grouping rule:** subtasks live in the parent's `task.jsonl`. A child gets its own folder only when it needs one (its own page, proofs, a `requirements.md`). A refinement of an existing task goes into that task; a new task is only for a new ask.

## 4. Land — with the `finish-task` skill

Improve this skill: append to `improvements.md`.
