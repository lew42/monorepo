verdict: fix
1. [fix] The task can't be picked up from its folder: task `o25d5dte` in `../session.jsonl:13` still says `"state":"queued"`. Nothing marks it started, links it to `errors/`, or records the branch or commit `b332e4ea7`. The only link is a free-text log line at `../session.jsonl:66`. Set the task's state and `dir`, and close it with an outcome once the branch merges.
2. [note] No test covers the wiring the "Done when" depends on. `Servex/ErrorLine.test.mjs` calls `ErrorLine.note()` directly, so nothing proves that a throwing tool behind `server()` (`Servex/agents/tools.js:614`) or `MCP.call()` (`Servex/MCP.js:106`) writes exactly one line and still returns `isError`. A three-line test would prove it: `server()` with a stub tool that throws, then read the last line.
3. [note] Every thrown tool error now writes a line, including the agent's own mistakes (bad arguments, "no such path"), so a busy agent's `session.jsonl` may collect many `"error"` lines that are not bugs. Watch the volume after the restart before also adding non-tool catch sites.
4. [note] The new line comes from `SpawnLog.note`, so it carries `ts` (`Servex/SpawnLog.js:52`), while the pid lines from `SpawnLog.put` carry `at`. The contract in indexing-past-work §6 says "`by` and `ts`", so the new line is the one that follows it; the pid lines are the ones that differ.
5. [note] It meets the brief. The line puts `error` as its first key, followed by `where`, `tool` and `agent` (`Servex/ErrorLine.js:28`). The tool still returns its error result. `note()` is wrapped in try/catch and its write is async with `.catch`, so a failed write can't add a second error. `MCP` is assign-based (`initialize()`), so the `on_error` option set in `Servex/Servex.js:148` reaches `this.on_error`. I ran `node Servex/ErrorLine.test.mjs` in the worktree: ok.
6. [note] The docs are up to date. `Servex/readme.md` lists `ErrorLine.js` and its test, `doc/tool-process.md` "If a tool throws" describes the line, and the indexing-past-work §5 row changed from "planned" to "works … from the first Servex restart". The `errors` log fits the readme's existing `logs/<name>.jsonl` pattern. I found nothing new left unlisted.

## Requirements
- 1 "Make a caught error leave that line beside the work, so `git grep '"error":'` finds it" — yes — `ErrorLine.note` writes to the caller's session log through `SpawnLog.note` (`Servex/ErrorLine.js:33-37`), and the test reads it back from `session.jsonl`.
- 2 "one `{"error","where","tool","agent"}` line in the caller's `session.jsonl`" — yes — test asserts `error`, `where` (`Servex/agents/tools.js:612`), `tool`, `agent`, `by`. The two doors (in-process `server()`, HTTP `MCP.call`) are separate, so one throw makes one line.
- 3 "the tool still returns its error result to the agent" — yes — both catch blocks still return `{isError: true}` after the note (`Servex/agents/tools.js:614`, `Servex/MCP.js:106-107`).
- 4 "a failing log write never turns one error into two" — yes — `note()` try/catch, async write `.catch(() => {})`; test `doesNotThrow` with no agent and no sink.
- 5 "Live after the next Servex restart" — yes — stated in indexing-past-work §5 and the requirements; not yet merged (branch `worktree/resources-errors`).
- Class page — n/a (`ErrorLine` is a static helper and holds no state to watch).

## Words
- content — yes — the comments, the readme row and the doc sentence are plain and short. The §5 row is long but every clause is needed (where it lands, the fallback log, browser errors live elsewhere).
