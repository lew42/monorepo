# Where tasks live, and the JSONL channel idea — the owner's thinking, 2026-10-08

Recorded from dictation; open architecture, owned by the system-architecture mastermind (`2026-10-08/ai-system-docs`). Check what exists before building: `todo.md`, `asks.jsonl`, `cards.jsonl`, `servex-queue.json` (the Dispatcher queue), task dirs' `task.jsonl`, the Inbox, and the `append_log` / `page_note` / `inbox` tools.

## Tasks
- The task audit will turn up many asks that were never done. They need ONE organised, prioritised queue; today they are spread over the files above.
- A new task **stays inside the session that created it** until we know where it belongs. A task specific to one module then **moves (by reference, keeping the source link) into that module's folder** so future sessions working there see it. The source session keeps its record and its cost.
- Several agents creating tasks about the same module in parallel is risky; prefer separate worktrees and a single writer path (the append tool) per file.

## A JSONL message channel (visibility)
- Idea: any agent can **log a message to any path** with a tool; any agent can **listen** in that directory for new messages. It is a communication channel between agents **and** one the owner can watch in real time, instead of hidden session-to-session messaging. Tangible visibility is worth a lot.
- Questions: how an agent "listens" cheaply (a tail/Monitor on the file, no polling), how it avoids waking on every line, how messages are addressed (to an agent, to a module), and how this relates to the existing inbox and `send_to_agent`.
