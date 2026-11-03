# ledger-hooks

## The ask

Phase 2 of the `ai-server` effort (chat, 2026-08-15): the task ledger currently
relies on the AI remembering to log and to land. Move the mechanical half into
Claude Code hooks so the harness enforces it:

> and there are no hooks for these steps, we're currently relying on the ai to
> remember to do it. … the thing i'm worried about, is the task steps. for
> example, this 8-15 tabs-catch-fix task seems to be stuck at 5/6.

Design agreed: hooks write only mechanical lines; the AI keeps writing judgment
lines (`log` findings, `now`, `outcome`). Repo bloat bound: one `action` line
per **distinct file first touched**, never per tool call.

## What to build

All hooks are project-scoped in `.claude/settings.json` (MERGE into the
existing file — never clobber other keys), each a `node .claude/hooks/ledger.mjs <event>`
command (cwd is the project root). One script, four events, plus a tiny shared
"find my task" step.

**Finding the task:** hook stdin JSON carries `session_id`. The session's task
is the `public/framework/ai/*/*/task.jsonl` whose first `assign` carries that
`session_id` (also accept `<page>/ai/<slug>/task.jsonl` paths — search
`public/**/ai/*/task.jsonl`, skipping node_modules). Cache the found path in
the OS temp dir keyed by session_id (hooks are separate processes). No task
found → exit 0 silently, ALWAYS (sessions that only answer questions never
open one — that is correct, not an error).

- **SessionStart** (`source: "resume"` only): append
  `{"log": {"at": "<ISO local offset>", "msg": "session resumed"}}` to the
  task. Fresh starts append nothing — the launch assign already says it.
- **PostToolUse** (matcher `Edit|Write|NotebookEdit`): the touched file is
  `tool_input.file_path`. Normalize to repo-relative forward slashes. Skip
  silently when: outside the repo; basename is `task.jsonl`, `day.jsonl`,
  `usage.jsonl`, or `usage.json` (logging the log is a loop); or the file
  already appears in any `action` line of the task's log (**first-touch
  dedupe** — read the log, scan `action.files`). Otherwise append
  `{"action": {"at": "<ISO>", "did": "edit", "files": ["<path>"]}}`.
- **Stop**: if input has `stop_hook_active: true` → exit 0 (never loop).
  Read the task log's merged state (last values win): if `steps` exist,
  `step < steps.length`, and no `landed_at` → block with
  `{"decision": "block", "reason": "Your task ledger says step N of M with no
  landed_at — finish the remaining steps, bump step, or stamp landed_at with
  an outcome (public/<task>/task.jsonl)."}`. Anything else → exit 0.
- **SessionEnd**: if the task has no `landed_at`, append
  `{"log": {"at": "<ISS>", "msg": "session ended (<reason>) without landing"}}`.

Consult the current hooks reference (https://code.claude.com/docs/en/hooks) for
exact stdin/stdout schemas before writing — do not guess field names.

## Files you own

`.claude/hooks/ledger.mjs` (new), `.claude/hooks/readme.md` (new, one screen),
`.claude/settings.json` (merge hooks in), `.claude/skills/new-task/SKILL.md`
(update §4: hooks now own `action` lines for edits — sessions hand-write
`action` only for `run` deeds; do not double-log), and ONE sentence added to
CLAUDE.md's "Then log as you work" paragraph noting edit-actions are
hook-automated. Nothing else — the live-streaming task's agents own
Server/ and public/framework/{dev,ext}.

## Verification bar

Fixture-driven: pipe hand-written stdin JSON for each event into the script
and assert the appended/blocked output, using a scratch task dir under the OS
temp dir (point the script at it via an env override or by generating fixture
logs whose session_id you control — your choice, keep it visible). Cover: no
task found; first vs repeat touch of one file; the four skip-basenames; Stop
with steps incomplete (blocks), with landed_at (allows), with
stop_hook_active (allows); SessionEnd landed vs not. Then one LIVE end-to-end:
`claude -p --model haiku --session-id <fresh uuid>` in the repo with a prompt
that opens a minimal scratch task dir named for that session and edits one
scratch file under public/ (delete both after) — confirm the hook appended the
action line and the Stop gate let a landed ledger through. `node --check` the
script.

## Out of scope (log as phase-2b, don't build)

The server staleness sweep (files owned by live-streaming agents today);
`day.jsonl` hooks; migrating old tasks; any change to ext/JSONL or ext/AITask.

## House rules

CLAUDE.md rules. No npm deps — node built-ins only. Script under ~150 lines
(it is four small handlers); comments near zero, traps only. Windows is the
platform: paths arrive with backslashes, normalize; the hook command must work
from Windows PowerShell-spawned processes (plain `node` invocation, no shell
tricks).
