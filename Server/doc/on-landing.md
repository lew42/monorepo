# `Server/on-landing.mjs` — what runs the moment a task lands

The ledger hook (`.claude/hooks/ledger.mjs`) spawns `node Server/on-landing.mjs <task dir>` the
first time it sees a task's `task.jsonl` get a `landed_at` line. It runs every check below, once,
and appends one plain log line per check straight into that same `task.jsonl` — never a crash,
never a blocked landing: every check is wrapped so a failure becomes a log line, not a thrown
error, and the whole script always exits 0.

## The checks, in the order they run

1. **clarity** — a fresh Sonnet looks at the landed pages as the owner would (`.claude/skills/clarity/`). Spawned detached: it can take a minute or two, and nothing below waits for it.
2. **text-check** — walls of text (`text-check.mjs`).
3. **doc-check** — does every module the task touched have a `readme.md`, a `doc/`, and readme links that resolve (`doc-check.mjs`)? A dirty result also nags the task's card.
4. **owner-check** — does the task do what the OWNER actually asked, item by item (this page)? Also spawned detached, for the same reason as clarity: it spawns its own fresh reviewer and can wait several minutes.
5. **worktree-down** — the task's own private dev server is stopped once it's actually safe (`worktree-sweep.mjs`).
6. **lifecycle reap** — anything else the task still owns (a server started by hand, idle reviewers, headless browsers) is closed.
7. **layout-check** and **padding-check** — the pages the landing names, at four widths.

## Owner-check — the owner's own words, item by item

**Why:** a task can match its own `requirements.md` perfectly and still miss something the owner
actually asked for, if the brief that got written quietly dropped or reshaped a sentence. The
owner's rule (2026-10-01): "every task's landing review checks the OWNER'S WORDS … item by item,
not just the brief."

**Finding the words** (`find_owner_words` in `owner-check.mjs`), first one found wins:
1. `<task dir>/owner-words.md` — the file a voice session saves verbatim (`session-smart.md`).
2. The nearest ANCESTOR task dir's own `owner-words.md`, walking up the `parent_task` chain
   every nested task's `assign` line already records — a sub-task shares its parent's words.
3. The task's own brief (usually `requirements.md`): a pointer to another file — `` Owner's
   words: `path` `` (the same convention `review.mjs` already reads) or a markdown link to
   `owner-words.md` — or, failing that, a quote embedded the way a brief already writes them,
   `` The owner's words (date, …): "…" ``.
4. A **session** the task's first `assign` line points at — a `session` field, or an `agent`
   field shaped `session-fast-<id>` / `session-smart-<id>` (how a voice-session agent's own id is
   built, `Sessions.js`) — looked up in Servex's `sessions.json` for that session's own file, and
   every line the owner actually said in it.

Nothing found at all: one line, `owner-check: no owner words found`, and nothing else runs — most
quick fixes have no dictation behind them, and that is not a failure.

**Splitting into items** (`split_items`): the brief for this script named three tiers —
numbered lines, bullet lines, else whole sentences. Every real `owner-words.md` in this repo is
instead shaped as `## <date> — <topic>` sections of running dictation, with no numbers or bullets
inside it — splitting that into bare sentences would hand the reviewer hundreds of fragments with
no topic to check them against. So a fourth, higher tier runs first: two or more `##`/`###`
headings split one item per section, labelled with the heading's own words (already a one-line
summary of what was asked there). Only text with no headings falls through to numbered / bulleted
/ sentences, exactly as asked.

**The review:** one fresh Sonnet, spawned inside Servex the same way `clarity.mjs` and
`review.mjs` already do (never a resume — it has not seen the task's own conversation), given
every item, the landing's own `outcome` text, and — best-effort, from an `"(… merge <sha>)"`
mention in that outcome — a `git show --stat` of the actual merge. It writes
`<task dir>/owner-check.md` itself: a markdown table, one row per item, verdict `done` / `partly`
/ `missing`, with evidence. `owner-check.mjs` only reads that table back, to log one line —
`owner-check: N items, D done, P partly, M missing — owner-check.md` — and nag the task's card
(same shape as `doc-check`'s own nag) for any `missing` item.

Run it by hand on any landed task: `node Server/owner-check.mjs <task dir>`.

## Proved 2026-10-01

Against a real landed task, `public/framework/ai/2026-09-30/proposal-flow` (owner-words.md
present, 6 heading sections): `owner-check.md` came back with 8 items (one per heading), each
with real evidence read from the actual files — 1 done, 1 partly, 6 missing — matching that
task's own "wave A landed, wave B waits" framing exactly. Against a task dir with no owner-words
file, no ancestor, and no quoted owner's-words in its brief: one line, `owner-check: no owner
words found`, exit 0, no reviewer spawned.
