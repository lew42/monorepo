---
name: new-task
description: Open a task — create its ai/<date>/<slug>/ dir, open its task.jsonl log, and give it presence on Mike's dashboard. Run this BEFORE THE FIRST EDIT in ANY Claude session in this repo — building, changing, fixing, adding, refactoring, restyling, a doc pass, a rename, a demo, a bug fix — and when an agent embarks on a distinct sub-project. Also on "new task" / "start a task". Not needed to answer a question, read, investigate, or prepare — but the moment that turns into an edit, run it. Unsure? Run it.
---

# New task

Anything that changes the repo is a **task**: a directory at
`public/framework/ai/<YYYY-MM-DD>/<slug>/` whose append-only `task.jsonl` the
day dashboard (`/framework/ai/<date>/`) renders live. Open it **before the
first edit** — not once the work feels big enough. The dashboard is how Mike
sees what's in flight; work that never opened a task is invisible to him, and
this was being skipped (Mike, 2026-08-15). Reading, investigating and
answering questions are exempt — the moment they turn into an edit, open one.
When genuinely unsure, open one: a thin log costs nothing, a missing one costs
the whole record. A **session** (one
Claude tab, one transcript uuid) usually works one task; sub-work it spawns
stays grouped under it. Log format: `public/framework/ext/JSONL/readme.md`;
viewer: `public/framework/ext/AITask/readme.md`. Legacy `session.json`
manifests still render read-only — never write a new one.

## 0. Operating mode — autonomous

Tasks should generally be **autonomous** — don't stop to ask for feedback.
The goal is completing the task as quickly and thoroughly as possible without
questions:

- When there are options, defer most non-MVP features to **phase 2** (note
  them in the readme) unless specifically requested.
- When a design decision genuinely needs Mike, don't halt — (simply) build
  the feature in a way that **visually illustrates the dilemma**: show it
  somewhat broken, or show it multiple ways side by side, and log the
  question. The rendered page is the question.

## 1. Name it

Kebab-case summary, matching the VS Code tab title (the extension titles the
window after the conversation) — e.g. `build-draggable-panel`. Find yours:

```powershell
Get-Process Code -ErrorAction SilentlyContinue | Where-Object MainWindowTitle | Select-Object -ExpandProperty MainWindowTitle
```

That lists every window; yours is the one matching this conversation's topic.
One window per task keeps the mapping unambiguous — the dashboard shows the
tab label so Mike knows which window to switch to.

## 2. Create the dir: brief + first log line

- `requirements.md` — the ask **verbatim**, plus scope and file-ownership
  fences if agents will run.
- `task.jsonl` — **at launch, not at the end**. One JSON object per line, one
  verb per key — `assign` merges onto the task's state, `log`/`action`/`agent`
  append — each value self-contained. Line one is an `assign` with the launch
  state:

```json
{"assign": {"session_id": "<$env:CLAUDE_CODE_SESSION_ID>", "tab": "<window label>", "group": "<the effort>", "request": "<the ask, verbatim>", "requested_at": "<ISO now, local offset>", "model": "<your model>", "window": {"before": <FRACTION of the 5h window used — percent / 100, e.g. 0.12>}, "now": "scoping", "steps": ["<step>", "<step>", …], "step": 1}}
```

**`group` is the effort** — the thread this belongs to, which outlives the day
and is how `/framework/ai/` organizes everything. Reuse an existing slug
wherever one fits (`ai-log`, `layout`, `panels`, `vision`, `apps`, `web-ui`);
coin a new one only for genuinely new ground. Omit it and the task shows up
under *loose*, which is a fine answer for a true one-off.

⚠ **`session_id` is not optional.** Without it the task's detail page has no
transcript to fetch and renders no log at all — the one field whose absence
costs the whole session record.

### `steps` — the outline IS the progress bar

`requirements.md` documents the ask; the **proposal** in it is an outline of
steps, and that same outline goes in the launch `assign` as `steps`. From then
on `step` is the 1-based index of the one underway. Two fields, and everything
derives from them: the card's segmented bar, its `3/8`, and the detail page's
checklist. Nothing can disagree with anything.

- Aim for **5–10 steps** — enough that a bar moving means something, few enough
  that each is a real milestone.
- Bump `step` when one genuinely finishes, and carry a `now` line that says
  what's happening *inside* it ("Building x, y and z").
- Land with `step` at the last index; `landed_at` reads as all-checked whatever
  `step` says.

- `../day.jsonl` — append one line, creating the file if the day is new:

```json
{"log": {"at": "<ISO>", "task": "<slug>", "msg": "task opened — <one line>"}}
```

The card shows RUNNING (pulsing) the moment the first assign lands; an
`assign` carrying `landed_at` is what flips it to landed — stamp that LAST.

## 3. Register + usage

- Leave the task dir **undeclared** — do NOT add it to the day page's
  `children:` unless the dir has its own `page.js`. A declared child skips
  the day page's dynamic `route()` (`route()` sees undeclared names only)
  and 404s on the `page.js` probe. The dashboard enumerates task dirs from
  `directory.json`, so the card appears either way; declare the slug only
  when a curated `page.js` lands.
- Refresh the usage snapshot — one API call, feeds the dashboard strip:

```bash
python "$USERPROFILE/.claude/bin/claude-usage.py" --json > public/framework/ai/usage.json
```

⚠ **Not `Out-File -Encoding utf8`** — Windows PowerShell 5.1 writes a BOM, and
`json.load` on the result dies with *Expecting value: line 1 column 1*. The
browser's `response.json()` strips it, so the dashboard looks fine and only the
command line notices.

Re-run **about every 15 minutes while actively working** — at natural
checkpoints, never tighter (the endpoint 429s under polling). Take
`window.before` from it now; write `window.after` at landing. Each refresh,
also append the snapshot to the history log `public/framework/ai/usage.jsonl`
(the timeline's window band reads it):

```json
{"log": {"at": "<ISO>", "session": <pct>, "weekly_all": <pct>, "weekly_scoped": <pct>, "resets_at": "<five_hour.resets_at>"}}
```

## 4. While working, log — don't just narrate

The log is the browsable record; the chat scrolls away. Append at every state
change and meaningful step — never rewrite earlier lines.

⚠ **Every append reloads Mike's open tab** (the live-reload socket watches the
file). Log **milestones, not keystrokes** — a step boundary, a finding, a wave
of edits batched into one `action`. A line every few minutes is the record; a
line every few seconds is a page that will not sit still to be read.

- `{"assign": {"now": "<one line>"}}` — whenever what-you're-doing changes;
  the card displays it.
- `{"log": {"at": "<ISO>", "msg": "…"}}` — findings, decisions, verification
  results.
- `{"action": {"at": "<ISO>", "did": "write|edit|run", "files": ["…"]}}` —
  deeds, batched per wave rather than per keystroke.
- `{"assign": {"links": [{"url": "…", "label": "…"}]}}` — as soon as an
  output is viewable, not at landing. `assign` replaces the whole array —
  resend the full list. A task whose output is genuinely *viewable* can go
  further: its own `page.js` overriding `preview()` with a live thumb
  replaces its row entirely.
- `{"agent": {"kind": "agent|cli", "task": "<one line>", "model": "…"}}` AT
  DISPATCH; when it lands, resend with the same `task` plus `outcome`,
  `tokens`, `duration_ms` — TaskJSONL merges by `task`. An agent line without
  an outcome reads as the card's current sub-task.
- **Spawn default is `claude-sonnet-5`.** Opus is a deliberate escalation for
  contested judgment or expensive-to-botch edits; NEVER fan out Fable.
- A spawned agent embarking on a **distinct** project gets its own task dir,
  carrying **your `group`** in its first `assign` — not your slug. `group` is
  the *effort*, not who spawned whom; sub-work belongs to the same thread as
  the work that spawned it. Anything less than a distinct project stays an
  `agent` line in yours.

### ⚠ A page nobody links to does not exist

**Nothing crawls the filesystem.** A `page.js` you created is reachable only
from whatever declares or links it — so a task that ships a page and stops at
the `links` array has shipped a URL Mike has to type by hand. He has had to,
repeatedly (2026-08-14). `links` is the *log's* record of the deliverable; it
is not navigation.

**Before landing, every page this task created is linked from at least two
places** — its `links` line, and **somewhere a reader would already be**:

- **Its parent's `children:` string** — the one that puts it in the nav and on
  the parent's wall. A task dir with its own `page.js` gets declared in the day
  page's `children:` (a dir *without* one stays undeclared — that is the
  `route()` rule in §3, and it is the only exception).
- **The page it is about.** A review of `ext/Panel` earns a line on
  `/framework/ext/Panel/`; a new module earns the "Next:" line on its
  neighbour. One sentence with the link, in the prose, where the reader
  already cares.
- **The day page's `content()`**, for anything a reader of that day should see.

Then **name the URLs in the landing `outcome`** — first line, clickable. If
you cannot say where a page is linked from, it is not linked; go and link it
before you write `landed_at`. Verify by loading the parent and clicking
through, not by loading the page's own URL.

### When to spawn at all

**A task does not imply minions.** Most tasks are one session working alone —
the dir, the log and the URL are the point, and `agents` is one optional field.
Spawn when the work is **wide**, never when it's deep (Mike, 2026-08-14):

- **Context management** — an unrelated errand that would pollute what's
  currently loaded. Offload it and keep this context on the thing it's for.
- **Context-specific analysis** — a question asked across a *set* of files:
  audit every layout page, read fifteen transcripts, check every call site. The
  answer comes back small; the reading never enters your window.
- **Parallelization** — the same specific task on N things. N UI components, N
  screenshots, N modules: they don't interact, so they all run at once.

Against it: design and naming decisions (a brief good enough to delegate one
*is* the decision, written worse), anything under ~20 minutes of your own work
(the brief costs more), and anything touching shared seams (merge cost eats the
parallelism).

**Which spawn.** For workers that need your already-loaded context — the file
you just read, the reasoning you just did — load the `fork-claude-session`
skill: a fork inherits the conversation. A cold Agent spawn with a distilled
brief is dramatically cheaper and is the right call whenever a brief will do.

## 5. Land it

**First, link the deliverables** — every page this task created, linked from a
parent's `children:` or from the page it is about, not just from `links`. The
rule and how to check it: *A page nobody links to does not exist*, §4.

One final `assign` — `landed_at`, `outcome` (first line is what the card
shows), `window.after`, and the spend **derived from the transcript, not
guessed**: every assistant line of
`~/.claude/projects/<cwd-slug>/<session_id>.jsonl` carries `message.usage`;
dedupe by `message.id` and sum.

```json
{"assign": {"landed_at": "<ISO>", "outcome": "**what landed** — …", "window": {"before": 0.12, "after": 0.28}, "tokens": <total>, "usage": {"input": …, "cache_write": …, "cache_read": …, "output": …, "calls": …}}}
```

`window` is replaced whole — carry `before` into the landing line. Keep the
four-way `usage` split alongside the headline total: cache reads cost ~0.1×
input, so a bare sum misleads. Then close the day log:
`{"log": {"at": "<ISO>", "task": "<slug>", "msg": "landed — <one line>"}}`.
A curated `page.js` in the task dir is optional — it wins over the dynamic
AISession viewer when present.
