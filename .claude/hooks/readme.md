# .claude/hooks

`ledger.mjs` is one script, four Claude Code hook events. It writes the
**mechanical** half of a task ledger so the harness enforces what the AI used to
have to remember. Judgment lines — `log` findings, `now`, `outcome`, `steps` —
stay hand-written by the session. Node built-ins only, no deps.

Every event first resolves *this session's task*: the `task.jsonl` under
`public/` whose **first `assign`** carries the stdin `session_id`. Both shapes
are found — `public/framework/ai/<date>/<slug>/` and `<page>/ai/<slug>/` — by
walking `public/` (18 ms; `node_modules` and dot-dirs pruned), then cached in
the OS temp dir as `claude-ledger-<session_id>.txt`, because each hook is a
separate process. **No task found is always a silent exit 0** — a session that
only answers questions never opens one, and that is correct.

⚠ **Subagents share the parent's `session_id`**, so for them the session match is a
sibling's live task as often as not. An edit's own path is ground truth (the first
`task.jsonl` walking up); a subagent is **pinned** to that task from its first in-dir
write — the `task.jsonl` line `new-task` has it write counts, even though that write
is not logged — and until pinned it gets **no guess** (2026-08-18: four out-of-dir
edits landed in a sibling's log before this).

| Event | Wired as | Appends |
| --- | --- | --- |
| `SessionStart` | matcher `resume` | `{"log": {…, "msg": "session resumed"}}`. A fresh start appends nothing — the launch `assign` already says it. |
| `PostToolUse` | matcher `Edit|Write|NotebookEdit` | `{"action": {…, "did": "edit", "files": ["<repo-relative>"]}}`, **once per file per task**. |
| `PostToolUse` | matcher `Skill` | `{"log": {…, "msg": "skill: <name>"}}` — every skill call, so trigger skills are auditable. |
| `Stop` | every turn | Nothing. Reads merged `assign` state and blocks with `{"decision": "block", "reason": …}` when `steps` exist, `step < steps.length`, and there is no `landed_at`. |
| `SessionEnd` | every reason | `{"log": {…, "msg": "session ended (<reason>) without landing"}}`, only when `landed_at` is absent. |

## What will bite you

- **`Stop` must exit 0 whenever `stop_hook_active` is true**, before any other
  work. Blocking again after your own block loops the session forever. That
  guard is the first line of `run()`.
- **Never append to `task.jsonl`, `day.jsonl`, `usage.jsonl` or `usage.json`
  from `PostToolUse`** — logging the log re-fires the hook. The `skip` set is
  matched on basename, so it holds for any task dir anywhere.
- **First-touch dedupe reads the log**, scanning every existing `action.files`
  for the repo-relative path. It is per *task*, not per session: a resumed
  session re-touching a file it already logged stays quiet. Repo bloat bound is
  one line per distinct file, ever.
- **A log written by the `Write` tool has no trailing newline.** Appending
  straight onto it produces one line holding two JSON objects, which fails
  `JSON.parse` — so the hook's line *and the launch `assign` it landed on* both
  vanish from every reader, silently. `append()` sniffs the last byte and
  prefixes a newline. Found by the live smoke test; the fixtures had missed it
  because they all wrote well-formed logs.
- **The Stop block's `reason` is the entire UX of the gate** — it is the only
  instruction the blocked session gets. It spells out the literal line to
  append, because the first live test answered a vaguer reason with
  `{"landed_at": …}` as a top-level verb, which is not a landing at all.
- **The script never throws.** `run()` is wrapped and the process always exits
  0 — a broken ledger must never break a session. The cost is that failures are
  silent; when a line you expected is missing, run the fixtures.
- **Windows paths arrive with backslashes**; `rel()` normalizes to forward
  slashes and returns `null` for anything outside the repo, including another
  drive (where `path.relative` hands back an absolute path).
- `LEDGER_ROOT` overrides the repo root. It exists **for the fixtures only** —
  nothing in normal operation sets it. Without it the root is resolved from
  `import.meta.url`, never from `cwd`, so the hook works whatever directory
  Claude Code spawns it in.

## Wiring

Merge into `.claude/settings.json` (exec form — `args` means no shell, which is
what makes a bare `node` safe from a PowerShell-spawned process):

```json
"hooks": {
  "SessionStart": [
    { "matcher": "resume", "hooks": [ { "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/ledger.mjs", "session-start"], "timeout": 15 } ] }
  ],
  "PostToolUse": [
    { "matcher": "Edit|Write|NotebookEdit", "hooks": [ { "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/ledger.mjs", "post-tool-use"], "timeout": 15 } ] },
    { "matcher": "Skill", "hooks": [ { "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/ledger.mjs", "post-tool-use"], "timeout": 15 } ] }
  ],
  "Stop": [
    { "hooks": [ { "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/ledger.mjs", "stop"], "timeout": 15 } ] }
  ],
  "SessionEnd": [
    { "hooks": [ { "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/ledger.mjs", "session-end"], "timeout": 15 } ] }
  ]
}
```

`Stop` takes no `matcher` — it fires on every turn and the docs give it no
matcher support. `Stop` also does **not** fire for subagents; that is
`SubagentStop`, deliberately unwired, since a subagent's edits already land on
its parent's ledger through `PostToolUse`.

## Testing

Fixtures drive real stdin JSON through the real script against throwaway repo
roots in the OS temp dir (`LEDGER_ROOT`), asserting the appended line or the
blocked stdout — 34 cases covering every branch above. They live in the session
scratchpad, not the repo. Rebuild from this readme's table if you need them
again, and `node --check .claude/hooks/ledger.mjs` after any edit.

Design record and the phase-2b deferrals:
`public/framework/ai/2026-08-15/ledger-hooks/requirements.md`.
