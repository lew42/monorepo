verdict: pass
1. [note] The write answer's `now: {state, completion}` is always the root's (Servex/agents/page_tools.js:1053), even when the delta walks into a child (`{"<id>": {"complete": {}}}`), so a caller that wants the child's new state still needs a read. Worth one sentence in Servex/doc/item-tool.md, or answer the targeted child's state instead.
2. [note] The same "write, then read the picture back" helper is written three times: honest-completion.test.mjs:14, verb-note.test.mjs:12 and item_tool.test.mjs:19 (`read_back`). One shared helper beside the tests would be simpler.
3. [note] The diff itself leaves Servex/doc/item-tool.md and core/Task/readme.md saying a write answers the state. The follow-up commit e8dfa2bc4 on worktree/qf-3 fixes both, so merge the two commits together. core/Task/doc/process.md:89 still says the tool "answers with the computed state" with no read/write split.
4. [note] The `log_cost` cache (Servex/agents/Agents.js:748) is keyed on each log's size and mtime only. If an agent's `provider` changes in the registry while its log stays the same, the cache returns the old cost. That's unlikely and cheap to accept.

## Requirements
- "a write returns {ok,id,line} without session_state" — yes — page_tools.js:1049-1056: a Task, Session or Process write returns `{ok, ids, line, size, now, warning?, homes?, instructions?}`, with no `state`. The unchanged-verb check now uses a cost-free fingerprint (`print`, :1032) instead of two full `task_state` calls.
- "answers the line it wrote in under a second on this session's record" — yes, by the author's measurement (not re-measured: re-measuring would mean writing to the live record). The commit f795532e9 message says about 20 s became 10–14 ms, and session-is-a-task/slow-write.md:3 says 5–7 ms.
- "the full picture is a read" — yes — `delta === undefined` still returns `state()` (page_tools.js:930). The log_cost cache also makes a warm read about 56 ms (slow-write.md:3).
- "the item tool's tests pass" — yes — I ran them on worktree/qf-3 (which contains f795532e9): item_tool 96 checks, item-local 6, honest-completion and verb-note all pass, and handover (10) and requests (6) also pass.
- "a small merge on its own" — yes — 6 files, +43/−20, only Servex/agents.
- Callers that read `state` from a write — none broken: core/Item/Store.js:206 reads only `ok`/`stubbed`, AICost.js asks a query (not a write), and the Server/*.mjs callers read `ok`, `homes` and `suggest`.
- New or changed class with a live-instances page — n/a (no class added).
## Words
- Comments are plain and say why (page_tools.js:1049-1051, Agents.js:746-747) — yes.
- Commit message states the outcome with numbers — yes.
