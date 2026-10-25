# Session identity: every line, cost and task attributed to the right session, never twice, never lost

Opus, high effort. **Investigate first, document thoroughly, then fix in small, reviewed, ready-to-merge steps.** The owner's words are in the prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl` (2026-10-24, "on the sessions list, how do I find this?… look into what this EB0F session is"): "it's of absolute importance that our session system does not misattribute things, that we don't lose data or put data in the wrong place or accidentally account for things twice or not at all."

## The two mysteries (found by the tab tonight)

1. **`eb0fe509-4cca-492e-bc22-017bbbc98f14`.** This VS Code tab's transcript (`~/.claude/projects/c--Code-lew42-monorepo/e00f55c9-bad4-4ee2-899e-d629ea1eede6.jsonl`, 59 MB) has 51 lines from 2026-10-21 03:44Z carrying that id. It has no transcript of its own.
   - What made them?
   - Is anything (cost, tasks, a record folder) filed under it?
   - The rest of the transcript keeps e00f55c9 through 14 compactions. Confirm that compaction keeps the id, for tabs and for SDK agents.
2. **SDK agents change id on revive.** Tonight `ai-system-mastermind` came back as `7c6c8d93…`, with `resumed_from: 2da03974…`.
   - Why: is it a resume, a fork, or a deliberate daily rollover?
   - Is the cost of both ids counted once, under the same record?
   - Where do the new id's log lines go?
   - What happens to work in flight at the switch?

Also: StaleClose stopped this live tab on 10-22 as "abandoned", because it judges by Servex agent activity, which a tab has none of. Fix it to use the transcript's last write, with a test. (This moves here from ai-system-mastermind's list.)

## Document the whole problem and solution space

Write `core/Session/doc/identity.md`, linked from the core/Session readme and the ai readme. Cover:
- **How a session gets its folder and record:** VS Code tab vs SDK spawn, who picks the path and name, and how a clash is avoided.
- **How the session id maps to the folder,** and every way an id can change: resume, fork, compaction, rollover, revive.
- **Who writes to which `session.jsonl`,** and what goes wrong if an agent writes to the wrong one.
  - Weigh the owner's idea: only the session (or ids mapped to it) may write to its record, while others add to it through a checked path, such as the item tool stamping `by`.
- **How cost follows an id chain** (resumed_from), so it is counted exactly once.
- **A check script that proves it:** for a session, every transcript id it owns, every cost counted once, every child linked, and nothing unattributed. Put its numbers on the tracking page.

## Long-lived roles and context (proposal; the owner is unsure, so propose with the tradeoffs)

- Should a "singleton" like ai-system-mastermind be reused by topic and recency (a follow-up within ~30 min on the same topic reuses it; a new topic starts fresh), rather than one session forever?
- **Every mastermind manages its children's context:**
  - the window size, the % used and the age;
  - compact (`/compact`) only between tasks, never mid-flight;
  - wait for the compaction to finish, with a timeout, so nothing hangs forever.
- Say what exists (`compact-before-sleep`, `nudge`, `oversized()`) and what's missing.

## Done when

- [ ] Both mysteries are explained in identity.md, with evidence.
- [ ] The check script runs on e00f55c9 and on one SDK agent with a resume chain, and its numbers are on the tracking page.
- [ ] StaleClose is fixed and tested.
- [ ] The proposals are written; any fix is small, reviewed and ready to merge.
- [ ] The task is completed with its outcome and links.

## Added (the owner, 2026-10-24)

- **A Servex restart must never fork a session id.** Prove it: agents revived after the 23:13 restart keep their ids (the deputy kept d9c3caec).
- **A singleton role (ai-system-mastermind) may get a new id on purpose,** but only as a logged rollover. The old id and the new one are linked, cost counts once, and the role's docs say it can be restarted at any time, so it always logs everything and needs no elaborate hand-off.
- Explain why it rolled over tonight (2da03974 → 7c6c8d93).
