# Servex: one `log` tool — path + line in, one stamped JSONL line out

Budget: $8. Sonnet, medium effort. Parent: mastermind-system-architect, who tails your `session.jsonl`: log an overview there as you go, not chat. Decision `d-which-one-tool-writes-a`, option A, in [the parent's log](../session.jsonl).

## The owner's ask (2026-10-20, 16:15 and 16:30)

Agents never append JSONL themselves through Bash. One tool: path + data → one line, stamped by node with the time, the session id and the author (and a link to the origin). It must be able to write a task line into a `session.jsonl` (the decided shape: a task is a line in its session's log, a session is a folder, every origin writes `ai/sessions/YYYY/MM/DD/<name>/session.jsonl`; [sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md) "The decided shape").

## Build (in a worktree)

1. **`Server/LogLine.mjs`, `class LogLine`**: `static append(target, lines, {by, session, origin} = {})` holds everything `.claude/hooks/append.mjs` does today:
   - follow moved paths (`TaskDirs.follow/refuse`);
   - pick `session.jsonl` vs `task.jsonl` (`SessionRecord.start_file`);
   - fill `"NOW"`, stamp `at`, validate (`jsonl-schema.mjs` `check`), append, re-parse;
   - return `{file, appended, at, bad}`; on a refusal throw the schema's reason.
   - **New:** when `by`/`session`/`origin` are given, put them beside the line's verb (`{"log":{…}, "by", "session", "origin"}`, like the item tool's `by`/`ts`).
   - **Check the schema** (`jsonl-schema.mjs`, in your fence): it accepts those keys on `session.jsonl`, `task.jsonl` and `page.jsonl`, and accepts `{"task":{"title", "state"}}` on `session.jsonl`; add what is missing.
2. **`.claude/hooks/append.mjs`** becomes a thin CLI over `LogLine.append`: same arguments, same output lines, same exit codes (2 usage, 3 refused, 1 bad line), same landing checklist. Prove it: run the old and the new CLI on copies of three real files (a `session.jsonl`, a `task.jsonl`, a `day.jsonl`) with the same input and diff the results (only the `at` times may differ).
3. **The `log` MCP tool** in `Servex/agents/tools.js`: `log({path, line | lines, origin?})`. `by` = `ctx.caller` (the calling agent's id), `session` = that agent's `session_id` (from `agents.live`), else the external tab's registered session. `path` accepts a repo file, a folder (its record file via `SessionRecord.log_file`), or a site url (`/framework/...`). Returns `{ok, file, at}` or `{ok:false, why}`.
4. `log_session` and `dir_log` keep their names and become callers of `LogLine` where they append (no behaviour change). `item`, `page_set` and `append_log` stay as they are; say why in one line in the doc.
5. **The rule, once, where agents read it:** one line in `.claude/skills/minion/SKILL.md` "While working" (replace the `append.mjs` sentence): "Write a log line with the `log` tool (Servex MCP); a hook or a script without it uses `node .claude/hooks/append.mjs`." Put the CLAUDE.md wording in `claude-md-proposal.md` in this folder (the owner applies CLAUDE.md edits).
6. Doc: `Server/doc/log-line.md` (what, who calls it, the three doors), linked from `Server/README.md` and `Servex/agents/readme.md`.

Proof: `node Servex/agents/log-tool.test.mjs` (a private host, not the live Servex) writes a task line into a temp `session.jsonl` with `by` and `session` filled; the CLI diff above is empty. Do not merge and do not restart Servex: your parent reviews the diff, merges and restarts. Land with `finish-task` in your own `session.jsonl`.
