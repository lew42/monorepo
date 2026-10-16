# Session accounting and past-work retrieval: requirements

The owner's asks for this task, dictated 2026-10-16 to the voice agent. Source: this session's opening prompt. Findings are logged in [task.jsonl](task.jsonl).

1. **Exact token accounting.** Every session and every turn is counted, including tool calls and thinking, with 100% accuracy.
2. **Two kinds of dollars, kept apart.** Claude Code plan dollars (a capped monthly plan, so the figure is somewhat arbitrary) are shown separately from OpenRouter dollars (billed to the penny).
3. **Roll-up.** A minion's usage counts toward its parent session. Totals roll up, but they can always be split back apart.
4. **The harness does the accounting, not the AI.** Servex's spawn/SDK code, which sees each result's usage, writes the record. No skill that an agent has to remember to use. The same code also runs over past sessions, from the raw `~/.claude/projects` transcripts.
5. **One session database.** All records go in the year/month/day folders under `public/framework/ai/sessions/`, with no separate parallel data structures. `Server/spend-tree.mjs` has the right design, but it is run by hand and its output has been stale since Oct 4.
6. **Past work.** Thousands of sessions are linked to the module or path they worked on. They can be found without copying whole transcripts. Open question: should sessions live inside module folders instead of one sessions folder?
7. **Honesty.** Confirm what actually works. No patches on a broken system.
8. **The MCP tool surface: pages are the unit.** Relayed by the voice agent on 2026-10-16. The owner says this repeats an ask from yesterday. Verbatim:

   > "We must not add a new tool set every time we add a data type. Tasks, cards, live pages, sessions, projects, users are all just PAGES: a page is the unit, addressable by APP PATH (not file path), nestable, and sub-page items without a file path are addressable too. So the tool surface should be: one page tool with a method parameter (read/set/add/reply/log/...), one file-system tool, one server/Servex tool, one agent tool; the ask_* family is unclear and may not be needed."

9. **The cloud voice session logs itself.** Relayed by the voice agent on 2026-10-16: every owner message in the cloud voice session is relayed automatically by the Servex MCP into a session log on disk, timestamped and flagged as a cloud session, so the voice agent never re-types the owner's words. Proposal: [cloud-voice-log.md](cloud-voice-log.md).
10. **One running total per session.** Each session keeps one pre-computed running cost. The harness updates it as each result arrives, so a grid of 100 sessions reads cost without re-summing transcripts. The detail page re-runs the exact counter over the raw transcript as a live audit, and any mismatch is a bug to fix.
11. **Rename: a session folder's `task.jsonl` is `session.jsonl`.** It is the session log. Estimate the system-wide rename. Answer: [answers.md](answers.md#r11).
12. **Folder slug and agent id match 1:1.** Today the role prefix is dropped (folder `voice-20261016`, agent `mastermind-voice-20261016`). Answer: [answers.md](answers.md#r12).
13. **One data system: Session extends Item, has a page.** It uses the same read/set/log methods, so no new tools or storage rules are needed. (Corrected by the owner on 2026-10-16. The first wording, "Sessions should be Page instances", is in git history.) Answer: [answers.md](answers.md#r13).

14. **The raw transcript is the single source of truth.** The raw Claude SDK transcript (`~/.claude/projects`) is the single source of truth for what happened in a session. Servex must NOT keep its own parallel session log of prompts, replies or usage; the `%LOCALAPPDATA%` `agent-<id>.jsonl` path is a candidate to scrap. Instead, a reliable script processes the raw transcript, and the session folder in the repo holds only derived, human-facing things: requirements, summaries, decisions, the running cost total and links. Answer: [answers.md](answers.md#r14).

15. **Decided: rename `task.jsonl` to `session.jsonl` in session folders.** Plan: [shape.md §4](shape.md).
16. **What `session.jsonl` holds, for its session:**
    - its requirements, fulfilled and checked (the task system's requirements);
    - tags of the core files and modules worked on (insurance for finding past work);
    - the aggregate running cost, derived from the raw transcript and never duplicating it;
    - knowledge of every task and sub-session inside it.

    Raw prompts: the owner is unsure whether to copy them, summarise them or just link them, and prompt refinement is low-confidence and may be skipped. One recommendation was asked for: link ([shape.md §2](shape.md)).
17. **Keep `public/framework/ai/sessions/readme.md` current** whenever a decision or the structure changes. This task owns it.

Also asked, and answered in [answers.md](answers.md): **Q1**, the agent logs in `%LOCALAPPDATA%`, and **Q2**, the three counters and which ones to delete. The owner's rule behind both: everything that exists is indexed in a readme, with no duplicate, stale or parallel data stores.
