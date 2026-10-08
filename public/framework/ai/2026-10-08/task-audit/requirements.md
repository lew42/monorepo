# Task audit — what was asked, what was done, what fell through (LIST ONLY — execute nothing)

Owner (2026-10-08, dictated). Lean on **Haiku** (under ~100k tokens a task it is very cheap; over 100k it costs ~5× more, still ~¼ of Sonnet) because tokens are tight. Audit past tasks: read what was asked and what was done, judge whether it was finished properly, and find **loose ends — anything asked and not worked on, or only half**. Include the **queued-but-never-run tasks** (the task queues; much was written up and never done). **Do NOT execute anything. Produce a list.** Present it as an **Inbox card** with an overview ("Task audit").

You are a **Sonnet 5.5 mastermind** orchestrating **Haiku minions**. Budget **$6 total** (you + all minions); tell each minion its own budget (~$0.30). Chat replies one sentence; detail in files. Load `servex-mastermind` + `decide`.

## The shape (a task runner, not one big reader)
- **One Haiku minion per small batch** (≈8–10 tasks, inlined into its prompt, so it reads nothing else and stays far under 100k tokens). Never one minion for all tasks.
- **Scripts do all searching/reading of raw data**; a minion judges only an inlined shortlist and answers `delivered | partial | not found` + one line of evidence per task. Spot-check a sample of Haiku's verdicts against script/git evidence and report its accuracy.
- Do not read raw session files into any model. Never replay sessions.

## Step 1 — find the sources of truth (Haiku or script; start from what exists)
Start from work already done (reuse it, don't redo it):
- `public/framework/ai/2026-10-08/mastermind-cheap-models/ask-ledger/` — 1,650 owner prompts pulled from the raw Claude session files; 1,483 have no match in `asks.jsonl` or the git log.
- `public/framework/ai/doc/log-sources.md` — the map of where each log lives.
- `public/framework/ai/2026-10-07/prompt-audit/` — an earlier audit (`audit.mjs`, `report.md`).

Add these sources to the map:
- `~/.claude/projects/` session files (sidebar, voice and OpenRouter prompts)
- `asks.jsonl`, `cards.jsonl`, `servex-queue.json`, `todo.md`
- every `task.jsonl` with no `landed_at`, or stopped
- earlier audit reports, and the Servex logs in `%LOCALAPPDATA%/lew42/servex/logs`

Show the map as one short table: source → what it holds → how far to trust it → how to query it cheaply.

## Step 2 — the list
Build `loose-ends.jsonl` (one row per ask/task: title, quote of the ask, source+date, state, evidence, suggested owner module) written through the Servex append tool/script, never hand-typed JSON. Rank: asked-never-started first, then half-done, then done-but-unverified. Merge duplicates (the same ask repeated across days = one row with a count).

## Step 3 — the Inbox card
Create the overview with `create_card` (type `task`, title in plain words: "Task audit: what was asked and never finished", task = this dir): counts per state, the top ~15 loose ends, links to `loose-ends.jsonl` and a browsable page. Add a page in this dir (`create_page`) showing the list filterable by state (use the existing ledger page pattern in `ask-ledger/`). Record one `Note:` for anything needing the owner.

## Step 4 — spend report
`spend.md`: tokens and $ per step and per minion, Haiku verdict accuracy, and what it would cost to run the whole audit again. If Haiku fails a task shape, say which and why.

## Rules
Branch/worktree for any site file; task-dir-only writes may commit directly. Commit with attribution, no loose files. Land with `finish-task`.
