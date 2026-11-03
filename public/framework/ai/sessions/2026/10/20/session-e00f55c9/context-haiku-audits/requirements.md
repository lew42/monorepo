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

## Part 2: the owner's next dictation (2026-10-24, prompt log line 405)

10. **Models and their costs: `ai/doc/models.md`, linked from the ai readme.**
    - Web-search the current Anthropic API prices for each model, with the caveats: long-context price tiers, thinking tokens billed as output, cache write and read prices, the batch discount. Add each model's context window.
    - Then recommend a model and effort for each kind of job, and say where model and effort are set today (`Servex/agents/roles.js`).
    - The owner believes Haiku over 100k is still far cheaper than Sonnet. Check it against the real numbers.
11. **Our own skill system: `framework/ai/skills/<name>/`.** Skills are plain readmes, so we stop leaning on Claude's skill system. Roles name the skills they lean on, and a skill can have one part per role.
    - Start with `framework/ai/skills/past-work/`. It's a step to run before building almost anything.
    - **The mastermind part:**
      - split the owner's prompt into separate searches;
      - give the worker the search terms, so both know what has been checked;
      - reuse the same Haiku agent for follow-ups, so its cache is reused.
    - **The worker part:** what the Haiku does, and logging each find the moment it's found.
    - Index it from the ai readme and the mastermind role readme.
    - Today's trial worked: `../past-work-per-file-docs/findings.md` found the `doc/file/` system, with 349 notes. Use its method notes.
12. **No new MCP tools.** The item tool is how an AI acts on anything. Processes are defined in readmes and data. Find out whether the item tool can already add a process to a session and spawn an agent from it. If it can't, that's the target: plan it.
13. **Roles, processes, skills, sessions.** How does a role or a process become a spawned session: its model, effort, system prompt, readmes and skills? Write a short design doc with one recommendation, and keep the number of roles small.
14. **Structured output first.** Results are written to files first, in a structured form, and go to chat second. The sidebar chat is the one exception. Add this to `ai/doc/agent-rules.md`, only the part that CLAUDE.md law 5 doesn't already say.
15. **The module audit (item 4) is queued, not built now.** It needs a mastermind, and it's heavy.
    - Record the open question with a proposed answer: when a task enters the queue, is it built automatically, at what priority, and as a quick first version or fully planned?
    - Each Haiku `claude.exe` takes 200–500 MB of RAM, so audits are overnight or downtime work, core modules first.
