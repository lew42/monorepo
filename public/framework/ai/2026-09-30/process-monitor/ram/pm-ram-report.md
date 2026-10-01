# RAM squeeze: idle worktree servers stopped, dormancy is per-role and per-request

Built in `worktree/pm-ram`, commits `103f0b53` (the quiet_min fix, asked mid-task) and
`4dfc0718` (asks 1, 2, 2b). Not merged yet — the parent mastermind asked to merge everything
for this task in one pass, to keep Servex restarts to one.

## 1. Stop what idle worktrees run

`Servex/Worktrees.js` now stops a worktree's dev server, its `Server/health.mjs` watcher and
that watcher's Chromium — through Servex's own stop path (`command(name, "stop")`) and
Lifecycle's own tracked `open()`/`close()` for the health watcher, never a guessed pid — the
moment its task is **paused, landed, or its agent has stopped**, or it has been **quiet 2
hours** with no live agent in it. A `qf-*` pool slot is never touched. Stopping is reversible
(the proxy restarts a project on its next request), so unlike removing the worktree folder it
never needs the branch merged first. Count: `summary().servers_stopped`. Doc:
[`Servex/doc/processes.md`](/framework/servex/doc/processes.md#stopping-an-idle-worktrees-servers-not-removing-it).

## 2 + 2b. Dormancy is per-role and per-request

`Servex/agents/Global.js` and `Servex/agents/tools.js`:
- Free RAM under 6 GB shortens the plain-role timer from 3 minutes to 30 seconds
  (`SERVEX_TIGHT_MB` / `SERVEX_DORMANT_TIGHT_MS`), logged once on each flip.
- The voice session's own pair (`session-fast`, `session-smart`) never auto-sleeps mid-session.
  One-off workers (`minion`, `reviewer`, `task-mastermind`) sleep the instant their turn ends,
  not after the 3-minute timer. Every other role (manager, assistant, `master-assistant`,
  `mastermind-servex`) is unchanged.
- `spawn_agent` and `send_to_agent` both take `dormant_after` (seconds, or `"session"`) to
  override the role's default for one agent, one request.
- Never sleeps an agent with a live background task (unchanged — `Agent.sleep()`'s own check)
  or one with a child still working — a reply is probably seconds away.
- `summary().dormant_freed_mb` sums the RAM each sleep gave back.

Doc: [`Servex/doc/dormant.md`](/framework/servex/doc/dormant.md#per-role-and-per-request-timing-dormant_after).

**Suggested line for the mastermind skill** (how to choose `dormant_after`, per the brief —
sent to the skills owner, not edited here): *about to read the agent's reply and might ask a
quick follow-up → `dormant_after: 60`; handing it off to a multi-minute review → `dormant_after:
0` (or just leave it at the role's own default, since minion/reviewer/task-mastermind already
default to 0).*

### Measured: is a cold resume actually slow?

Two resumes of real, stopped minion sessions (three days old, so past any cache TTL — never a
live one; checked both against the registry first): `ai2-overview`'s (~82k tokens before this
turn) and `ai2-workspace`'s (~215k tokens). Numbers straight from each run's own JSON result:

| | small session | large session |
|---|---|---|
| `time_to_request_ms` (process start + session load) | 139 ms | 149 ms |
| `ttft_ms` (first token) | 3024 ms | 3358 ms |

`time_to_request_ms` is the part that is actually different between a cold resume and an
already-warm process, and it is nowhere near 3 seconds either time — so `dormant_after: 0` stays
a true, immediate exit (`SERVEX_DORMANT_GRACE_MS` default `0`). The ~3.0-3.4 s to first token is
ordinary model latency paid on any turn, warm or cold, not a cost of having exited between turns,
so it did not move the default. If a more direct measurement of resume overhead alone ever
crosses 3 seconds, raising `SERVEX_DORMANT_GRACE_MS` adds a grace period to every zero-wait role
at once. Full reasoning: `doc/dormant.md`.

## Tests

`node Servex/processes.test.mjs` (ask 1 — this file has no dependency on the SDK package, so it
runs in this worktree with no `node_modules`):

```
processes.test: 22 checks pass
processes.test (with worktrees): 30 checks pass
```

Ask 2 and 2b's tests went into the existing `Servex/agents/global.test.mjs` (the established
home for `Global.js` tests — two of its pre-existing blocks had to be updated too, since my
change revises exactly the timing they checked: a task-mastermind and a minion now sleep the
moment they're swept idle, not after the old 3-minute timer for every role alike). **This file
could not be run here** — `Global.js` imports `Agents.js` (for `STANDING`), which needs
`@anthropic-ai/claude-agent-sdk`, and this worktree has no `node_modules` by design (a
pre-existing limitation of `global.test.mjs`, not something this change caused: it already
couldn't run here before this task touched it either). Verified with `node --check` (syntax only)
and a careful manual trace against the existing `fake_servex()` test harness's exact behavior.
**Left for the mastermind:** run `node Servex/agents/global.test.mjs` somewhere with
`node_modules` (the main checkout, or a Pool worktree) before merging, to actually execute these
checks.

## What was left

- The quiet_min() fix (asked mid-task, unrelated to the RAM brief but in the same file/fence):
  `Worktrees.js`'s `quiet_min()` was reading `logs/HEAD`'s file mtime, which `git gc` rewrites
  without appending a line — it now reads the unix timestamp off that file's own last line
  instead. Already covered by its own test in `processes.test.mjs`.
- `global.test.mjs` needs an actual run (see above) before this merges.
- The live effect (RAM actually freed) is for the mastermind to measure after the merge and a
  Servex restart, per the brief — not me.
