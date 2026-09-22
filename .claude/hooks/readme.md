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

## prompt-relay.mjs — the `UserPromptSubmit` hook

**Not wired yet.** The snippet below is for the owner to paste into `.claude/settings.json`
themselves — no agent edits that file.

Fires on every prompt, in every session, and does two separate jobs:

- **Every session** gets its prompt appended, verbatim, to `.claude/prompts/<day>.jsonl` — a
  private, git-ignored daily transcript that lives outside `public/` (never served to the LAN,
  never committed). A line that looks like it holds a secret (an API key, a token, a private
  key block — see the script's `SECRET_PATTERNS`) is written as `[withheld: looked like a
  secret]` instead. This is a heuristic, not a scanner — it catches common shapes, nothing more.
- **A session that has loaded the `assistant` skill** — marked by one line `ledger.mjs`'s Skill
  branch adds (`tool_input.skill === "assistant"` writes `claude-assistant-<session_id>` to the
  OS temp dir), or by typing the literal `/assistant` command, which this script marks itself
  since the Skill event for that same prompt fires too late to help it — additionally:
  - appends the prompt to the mastermind's inbox: the same `chat` shape `say.mjs`'s `relay`
    writes, `via: "assistant-hook"`, with `session_id` stamped on it;
  - appends it to the V3 board as the owner's own card (the same shape `say.mjs`'s `heard`
    writes by hand today) at `public/framework/ai/v/3/board.jsonl`, which the dev bar reads
    live — so the owner's words are on their screen before any model has answered;
  - prints a 3-line identity refresh to stdout, which `UserPromptSubmit` adds to the model's own
    context for that turn, so the assistant never has to remember what it is or that the relay
    already happened.

  Empty prompts and `/slash` commands are logged (job one, above) but never relayed or carded
  (job two) — neither is something the owner said to anyone.
- The mastermind's own session is never marked as the assistant: the marker is only ever written
  when a `Skill` event names `skill: "assistant"`, and the mastermind's own `SKILL.md` never
  tells it to load that skill.
- `LEDGER_ROOT` — the same override `ledger.mjs` already honours — relocates both the mastermind
  inbox lookup and the V3 board file for tests, since both live under
  `<root>/public/framework/ai/`; no second env var.
- Never throws, never blocks the prompt (`{"decision":"block"}` is only ever `ledger.mjs`'s
  `Stop` branch, never this script), exits 0.

Add to `.claude/settings.json`'s `hooks`:

```json
"UserPromptSubmit": [
  { "hooks": [ { "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/prompt-relay.mjs"], "timeout": 15 } ] }
]
```

### Testing

Same pattern as `ledger.mjs`'s own fixtures above: pipe real stdin JSON through the real script
against a throwaway `LEDGER_ROOT`, never the real repo paths. Covered: an unmarked session logs
the prompt but never relays or cards it; marking a session (as `ledger.mjs`'s Skill branch would)
makes its next prompt land in a scratch `mastermind-*/task.jsonl` inbox AND get a card in a
scratch `board.jsonl`; the literal `/assistant` prompt marks its own session (and is itself
logged, not relayed — it is a command, not a message); a `Skill: mastermind` (or any other
skill) load never creates the assistant marker; a secret-looking prompt is withheld in the log,
the relay, and the card; a whitespace-only prompt writes nothing at all; a different `/slash`
command is logged but not relayed or carded; one full invocation timed at ~65 ms end to end
(node's own process startup dominates that, same as `syntax-guard.mjs`'s ~60 ms note above).

Design record: `public/framework/ai/2026-09-19/prompt-relay/requirements.md`.

## hold-guard.mjs — the lapsed-reload-hold check

The full story and the design comment are in the file's own header; this is the short version.
`Server/hold.mjs`'s reload hold self-expires after 5 minutes on purpose (so it can never stick
forever), but that expiry used to be silent — an agent could believe it was still held when it
was not, and a real write once went out unheld because of it
(`public/framework/ai/2026-09-19/hold-guard/`).

Two halves:

- **`check(file, agent_key)`** — the half that works today. `ledger.mjs`'s `PostToolUse` branch
  already imports it, exactly like `syntax-guard.mjs` and `health-guard.mjs`, so no settings.json
  change was needed for this half. On every `Edit`/`Write`/`NotebookEdit` under `public/`, it asks
  whether *this* agent has a recorded hold that has since lapsed — if so, it silently renews it
  and prints one line saying so; if the agent never held one, or its hold is still genuinely
  live, it does nothing.
- **`record(command, agent_key)`** — remembers which `who` an agent took when it runs
  `node Server/hold.mjs on "<who> — <what>"` in a Bash command, so `check()` above has something
  to compare against. This half needs a **new** hook registration this repo does not have yet —
  a `PostToolUse` matcher on the `Bash` tool — which is the owner's file and their call. **Add to
  `.claude/settings.json`'s `hooks.PostToolUse` array:**

  ```json
  { "matcher": "Bash", "hooks": [ { "type": "command", "command": "node", "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/hold-guard.mjs"], "timeout": 15 } ] }
  ```

  Until that line is added, `record()` is simply never called, which is the safe default —
  `check()` then always finds no record for the writing agent and does nothing, same as an agent
  that never took a hold at all. The moment the line is added, both halves work together with no
  other change.

Proof (three real runs against the live `Server/hold.mjs` lock file, `RELOAD_HOLD_TTL_MS=5000` per
that file's own header): a lapsed hold gets renewed and says so; a write with no hold on record is
silent; a write while the hold is genuinely still live is silent and the lock file is untouched.
Full transcript: `public/framework/ai/2026-09-19/hold-guard/`.
