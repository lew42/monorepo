# Session accounting and past-work retrieval: requirements

The owner's asks for this task, dictated 2026-10-16 to the voice agent. Source: this session's opening prompt. Findings are logged in [task.jsonl](task.jsonl).

1. **Exact token accounting.** Every session and every turn is counted, including tool calls and thinking, with 100% accuracy.
2. **Two kinds of dollars, kept apart.** Claude Code plan dollars (a capped monthly plan, so the figure is somewhat arbitrary) are shown separately from OpenRouter dollars (billed to the penny).
3. **Roll-up.** A minion's usage counts toward its parent session. Totals roll up, but they can always be split back apart.
4. **The harness does the accounting, not the AI.** Servex's spawn/SDK code, which sees each result's usage, writes the record. No skill that an agent has to remember to use. The same code also runs over past sessions, from the raw `~/.claude/projects` transcripts.
5. **One session database.** All records go in the year/month/day folders under `public/framework/ai/sessions/`, with no separate parallel data structures. `Server/spend-tree.mjs` has the right design, but it is run by hand and its output has been stale since Oct 4.
6. **Past work.** Thousands of sessions are linked to the module or path they worked on. They can be found without copying whole transcripts. Open question: should sessions live inside module folders instead of one sessions folder?
7. **Honesty.** Confirm what actually works. No patches on a broken system.
