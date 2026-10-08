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

## Addendum (owner, 2026-10-08, later) — how to audit, and what to leave behind
- **Start from the most recent**, assume newest is most important. For each task read its **summary files first** (brief / proposal / `requirements.md` / `task.jsonl` / reports — they often quote the owner's actual prompt), so you get the raw intent without loading the raw session. Reading a raw session file is fine **only if it is short (<~100k tokens)**; never load a long, uncached one. Question to answer per task: was something asked, and was it **delivered** per the log/files?
- **Tag every audited session** with what it belongs to: an existing class, module, page, system or file, expressed as the same **icon-item references** used elsewhere (`#Page`, `/path`, class name). Tags let the Sessions table be **filtered/sorted by file, class or system** — pick ONE consistent tag format (record the alternative). Haiku minions add tags and notes through a **log tool** (below), not by editing files.
- **Log tool**: a Servex tool (script + MCP, in-process like the others) that appends a stamped, authored line to ANY session's `session.jsonl` from outside that session's own prompt — `{tag: ...}`, `{note: ...}`, `{alert: ...}`. Coordinate its line shapes with `2026-10-08/session-class` (`session.jsonl` = higher-level log; a granular `log.jsonl` per session is optional later, don't build two now — say how loading would work). A running session may tail its own log.
- **Red flags**: anything held up, unfinished, or **needing the owner** gets an `alert` line (with priority). The Sessions tab must be able to **filter for sessions that need attention, prioritized**.
- **Cost validity**: audit whether past tasks' costs are right, but going forward matters more than retroactive. **Never instantiate or resume an SDK session just to read its cost** (that triggers a cache write and costs money). Read the session file with a script. If the SDK offers a no-send way to read a session's usage, note it, and test it only if it provably sends nothing.
- Cross-domain, your call as mastermind: decide what is worth doing now vs queued, keep everything under the pace rule, and keep unblocked.

## Addendum 3 (owner, 2026-10-08, later) — focus systems, session readmes
- **Focus the audit on these systems first:** **transcription** (Whisper via Servex, the Dictate class, the Chat widget), and **prompt refinement** (part of that). Open design: whether the Chat window should be part of Dictate or the other way round — see `public/framework/ext/Chat/doc/panel-composition-2026-10-08.md` and `ext/Refine/doc/vision-2026-10-08.md`. Report what was asked vs built for each, as a loose-end list per system.
- **Each audited session gets a short readme** (create it if missing, update it if present, keep it under ~100 lines): an overview + inbox for the AI, linking to the session's data. Most of the data goes to JSONL for the UI; the readme is the always-fresh cheap context. Whether the Sessions page loads the readme as a tab or inline is undecided; just write it where the session's page can load it.
- **Watch the readme cost**: note any readme over ~100 lines in the chain you read, as a finding (a readme audit comes later, not now, to avoid a fan-out).
- New agents read `CLAUDE.md` then the readme chain to their path automatically; verify whether that actually happens in Servex spawns (grep the opening/preamble code) and report.
- Haiku 5.5 under ~100k tokens is ~1/20th the cost of Sonnet 5.5 (owner's figure): use Haiku for every audit-type job.

## Addendum 4 (owner, 2026-10-08, latest) — priority systems, directory audits, audit-phase limits
This phase is **audit and document only. No major coding, no API changes, no moves.** Haiku minions read, identify confusion, seek clarity, and make only very obvious, additive, easy updates (or **propose** updates). If something is obviously wrong, get a second opinion before fixing. Anything bigger needs a mastermind's approval and goes in a worktree.
- **Directory audits** alongside the session audits (a different thing from session audits), for the owner's top-priority systems, one directory at a time:
  1. **Transcription**: Whisper (run by Servex), Dictate, the Chat widget, clean transcription, prompt refinement. Consolidate into ONE place: if no single home exists, list every place it lives and make this task's Inbox card the conglomerate: "all the pieces, how they could be structured, what to call things, where each is found". Cross-reference: Servex docs mention how Whisper runs and link to Dictate/Chat, and they link back.
  2. **The core page system** (`core/Page`): what exists; `page.js` vs `page.jsonl` (which is now the norm?); dynamic pages and routing; the JSONL streaming/tail; how JSONL is split across several files; how to create a page and where files go. Not every class gets a readme audit — only this.
  3. **The AI system** (`framework/ai`): SDK, sessions, models, dashboard, inbox, plus Servex (`/framework/servex/`, find where its docs live) cross-referenced because Servex is integral to the SDK side.
- **Readmes front and centre**: where a page and a readme both exist, evaluate showing the rendered readme (markdown to HTML, working links, proper headings) at the top of the page so the owner can see what agents read. Report the state and options; don't build it.
- **Merge discipline for any worktree change you make** (put it in the merge docs if it is missing, and in your own practice): create a worktree, commit, then BEFORE merging the mastermind reviews the commit diff (is anything dangerous, would it break the site, anything obviously incorrect or inconsistent), runs the smoke/`check_page` step, and only then merges and closes the worktree. A quick look is enough for a small change. Report where the existing worktree/quick-fix/merge system is documented and what state it is in.
