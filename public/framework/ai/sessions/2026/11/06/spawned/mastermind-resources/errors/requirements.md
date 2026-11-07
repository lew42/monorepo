# Session logs: a line for every caught error

Task `o25d5dte` in [../session.jsonl](../session.jsonl) (voice-app item 7, lower priority).

**The ask.** The logging contract in [indexing-past-work.md](/framework/ai/indexing-past-work.md) (§5, §6) lists `{"error": "…", "where": "file:line"}` as an event, but nothing wrote it. Make a caught error leave that line beside the work, so `git grep '"error":'` finds it.

**What was built** (branch `worktree/resources-errors`, commit b332e4ea7):

- `Servex/ErrorLine.js`: `where(e)` finds the first stack frame inside the repo; `of(e, extra)` builds the line with `error` as its first key; `note(agents, who, e, extra)` writes it into the calling agent's session log (through `SpawnLog.note`), or into the Servex `errors` log when there is no agent. It never throws.
- Wired where a tool call is caught: `server()` in `Servex/agents/tools.js` and `MCP.call()` (through an `on_error` option set in `Servex/Servex.js`).
- Test `Servex/ErrorLine.test.mjs`; docs: `Servex/readme.md`, `Servex/doc/tool-process.md`, indexing-past-work §5.

**Done when.** A Servex tool that throws leaves one `{"error","where","tool","agent"}` line in the caller's `session.jsonl`; the tool still returns its error result to the agent; a failing log write never turns one error into two. Live after the next Servex restart.
