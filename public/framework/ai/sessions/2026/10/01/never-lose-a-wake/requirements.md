Budget: $12

# never-lose-a-wake — Servex keeps every wake, counts work by live pids, and reconciles rows with processes

The owner's words (2026-10-01, via vscode-mastermind): a wake message was LOST. `Agents.awaken()` → register → the idle sweep → `sleep()` in the same millisecond, because of a stale idle clock. The new queue was closed, the message pushed onto it was gone, and `send()` marked the agent "working" with no process: a phantom. vscode-mastermind's live patch: `sleep()` refuses for 60 s after `awoken_at` (`Servex/agents/Agents.js` ~line 937, committed on michael/dev). Your job is the deeper version, in six parts, plus a regression test.

## Fence
`Servex/agents/Agents.js`, `Servex/agents/Global.js` (the idle sweep), `Servex/Servex.js` (the working count, the spawn queue), `Servex/Heartbeat.js` and/or `Servex/TaskLoop.js` (escalation), tests beside them (`Servex/agents/*.test.mjs`, `Servex/*.test.mjs`), `Servex/doc/` (one short doc or a section in the existing one for agents' lifecycle), `Servex/readme.md` one line. Your own task dir. Nothing under `public/` except that.

## Build (in this order; commit after each)
1. **The idle clock resets on awaken.** Whatever `Global.sweep()` reads to decide "idle for N minutes" (`idle_since`, `last_at`, or similar) is set to now inside `awaken()` BEFORE `host.register()`; the 60 s guard stays as a belt. Review the patch: say on the card in one line whether it was right and what it missed.
2. **Working is counted by LIVE pids.** Wherever the cap "working N/5" is computed (`Servex.js`, search for the queue reason text "waits for a working agent to end its turn"), a row counts only if its process is alive (`claude_pid` and a `process.kill(pid, 0)` or the existing Processes map). A "working" row with no live process is a phantom: log it once (`this.say`), set it `idle`, and don't count it.
3. **A start that does not begin within 60 s is reset and re-queued.** A row in `starting` whose process never appeared (no pid, no first event) after 60 s goes back to the head of the spawn queue with its spec and its held messages, and one log line says so. Never dropped.
4. **Escalation falls back to the owner's Inbox when the card is missing.** Find the "no card live" failure in the heartbeat/task-loop escalation path; when the card can't be found, write the same text to the Inbox (`Servex/agents/inbox.js` — see how `inbox` lines are written) instead of throwing, and log one line.
5. **The queue never drops an entry.** `queue.close()` on sleep must hand any pending messages to the agent's `held_messages` (or the registry's held list — whatever `spawn_agent`'s `held_messages` already is), so the next `awaken()` delivers them. A message sent to a dormant or sleeping agent is held, never lost; a message sent to a `starting` agent is held until its first turn. Test both.
6. **A one-minute reconcile.** A timer (reuse the existing sweep interval if there is one) walks every registry row: `working`/`starting` with no live process → phantom handling from item 2/3; a live process whose row says `dormant`/`stopped` → log and adopt or stop it (choose the safe one: adopt if its session id matches, else stop). One summary line only when something changed.

**Regression test** (`Servex/agents/awaken-race.test.mjs`): a fake host whose `register()` runs the idle sweep synchronously with a stale clock; awaken a dormant agent; send one message; assert the agent is NOT dormant, the message is delivered (or held, then delivered on the next turn), and no row is "working" without a process. Also a test for item 5 (message to a dormant agent survives a sleep/awaken cycle) and item 2 (a dead pid is not counted).

## Proof (on the card)
- Test output: the new file plus the existing `Servex/agents/*.test.mjs` all passing.
- One line: the patch's verdict (item 1).
- The reconcile's summary line format, pasted once from a dry run.

## How you work
- Load the `minion` skill first, then `code`. Read the readme chain for `Servex/` and `Servex/agents/`, and `Servex/doc/` on the heartbeat and the queue.
- `take_worktree` from Servex (Servex may already have put you in one: check `pwd`); commit there by exact path. Review `--size light` (no page); answer every finding with an answer line in the main tree's `<taskdir>/task.jsonl` (`{"review":{"answer":{"n":N,"reply":"fixed: …"}}}` via append.mjs), then `MSYS_NO_PATHCONV=1 node Server/merge.mjs <worktree>`. Say "landed <sha>" and "needs a Servex restart" on the card. Do not restart Servex.
- Every look is headless. Log only through `node .claude/hooks/append.mjs <task.jsonl> <lines.json>`. Never the owner's name.
- Report on the card `2026/10/01/servex-never-loses-a-wake-the-awaken-the` (card_reply): two sentences at start, the proof when landed, or if blocked. Once landed: `return_worktree`, the last card line, end for good.

## 7. A spawn the gate lets through but the pool refuses is held, not failed (added 22:35)
Tonight at 20:38 `minion-never-lose-a-wake` (and `minion-fixer`, `minion-quick-merge`) left the spawn queue when the working cap cleared, and `Agents.spawn()` threw "No pool worktree is ready for minion … main stays refused" — the system.jsonl line says `"gate","state":"failed"`, the parent was never told, and the spec was gone. Fix: when the pool has no ready slot, the spec goes BACK to the head of the queue with reason "waits for a pool worktree" (and the pool tops up), and the parent gets one message the first time. A spawn's failure of any kind tells its parent. Test it beside the awaken race.

Live example for item 2 (22:40): `minion-lib-h1-page-nvidia-nemotron-3-5-lightning-free-1790890619269` sat in `starting` for 1 h 40 min with its pid (86536) dead, holding one of the five working slots. `stop_agent` on it was refused with `Bad log name "agent-minion-lib-h1-…"` (the id is letters, digits and dashes — find the real reason, probably length, and fix the check or shorten OpenRouter run ids). The reconcile (item 6) must clear such a row by itself.

**Second live example for item 7 (22:56):** `minion-lf-deepseek` (parent `task-mastermind-openrouter`) was queued on RAM at 22:37; at 22:56 the gate let it through and the OpenRouter pace guard refused it → state `failed`, one `system.jsonl` line, parent never told. The pace guard is a third refuser beside the cap and the pool: the same rule applies — the spec goes back to the head of the queue with the reason, and the parent hears once.
