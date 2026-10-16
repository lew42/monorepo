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
