# Context, Haiku for long reads, module audits, past-work search

For `ai-system-mastermind`. The owner's dictation (2026-10-24), verbatim in the prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl` line 402. **First, add each numbered item below as a child task of this folder with the item tool** (`item({path: "<this folder>", delta: {"tasks": {"add": {...}}}})`). Then follow the plan-or-do rule: do the notes and docs now, plan the big ones. Budgets are estimates, not caps.

1. **`ai/doc/context.md`** (new, linked from the ai readme, cross-linked with `context-drift.md` and `compaction.md`). It covers:
   - what a context window is, and its size for each model;
   - whether a session's context size can be read live (Servex already records `context` per agent in `list_agents`);
   - auto-compaction;
   - context dependency: a fresh agent loses whatever the last one loaded unless it was written down;
   - context pollution: a second pass that reads the first pass's findings tends to follow the leader;
   - working in context-independent phases, where each phase writes findings for the next.
2. **Haiku over 100k tokens.** For long reads (deep readme dives, sweeps over many search terms), Haiku's cheap, large context is worth going past 100k. Update the "audits go to Haiku, under 100k" guidance in `ai/doc/agent-rules.md` to say when. The first trial is running now: `../past-work-per-file-docs/` (its findings.md has method notes).
3. **Parallel Haiku.** Independent agents each write to their own subfolder and never read each other's work, so there's no bias. When they agree, that's a stronger signal. Vary the effort or the model rather than repeating the same run. Write it down as an idea (don't build): compare Sonnet on low effort with Haiku on xhigh, and benchmark questions that have clear right answers against open-ended ones.
4. **The module audit process** (plan first; it's big). A Process is a task template with node-driven steps.
   - A manager mastermind picks the modules and the settings: depth, and time per module.
   - A Haiku auditor runs the process on each module. It reads the files, most important first, and writes a per-file doc for each, using the per-file doc system the search in item 2 finds.
   - Each module gets an `audit.md` that ranks the changes by ease, benefit and priority, and covers duplicates and misplaced files.
   - The audit proposes tasks into the queue.
   - This is the idle work: when nothing is running, it runs.
5. **Past work via Haiku, as a reusable skill or tool** (design it after the item 2 trial lands).
   - The asker (an Opus mastermind) turns the owner's words into search terms, likely modules and paths.
   - It spawns a Haiku child session, which reads the logs first for anything done recently.
   - Each find is reported the moment it's found, as a structured result item in the child session (a results list, through the item tool).
   - The session shows as done (a check mark) when the search ends.
   - Seen today: a minion can't spawn with no free pool worktree, even for read-only work. The search had to spawn as a task-mastermind instead.
6. **Mastermind types.**
   - A "core page mastermind" is a defined, repeatable type: a role row, or its prompt in the system prompt, so it survives compaction.
   - `core/Page/readme.md` says plainly "read `core/Item/readme.md` first" and assumes the reader has.
   - The mastermind role readme lists the subject masterminds: the AI system one, and page/item/JSONL streaming.
7. **Quick-fix worktree reuse.** From the logs, measure how often quick-fix worktrees are reused and how often new worktrees are made. If the pool sits unused, say so.
8. **Note only, don't build:** a per-module log view. It shows everything done in a module, filterable like a database (by type and date), with control over the columns, like the inbox and the sessions grid. Record it in the doc where it belongs.
9. **Sessions show their tasks and completion.** The owner wants to see each session's tasks and how many are done, including this session (e00f55c9). Check that the session page shows it, and put the link in your show line.

Land each with a `show:` log line and links. The AI dashboard rethink (`/framework/ai/` should open on a dashboard; the inbox is broken) is the page mastermind's, after it talks with the owner. Leave it out of this list.
