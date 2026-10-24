verdict: pass
1. [note] The compaction cost was measured on an older nudge compaction (158k → 17k, $0.24), not on a compaction this new hook triggered. That is fine as "the cost of one compaction" (ask 3), but the first real `why: "sleep"` line after the restart should be checked against it — Servex/doc/dormant.md, "Measured cost".
2. [note] An agent that goes to sleep and never wakes again pays for its compaction for nothing (about $0.24 at 158k). The doc says "one compaction pays for itself at the first wake", and that only holds when there is a wake. Worth one line in dormant.md; one-pass roles are stopped rather than slept (Agents.js:2041), so they are not affected.
3. [note] After a compaction, the dormant log line records `after: 0` (Agents.js:2120, `mark_slept(this, 0)`), though the agent really waited its idle time plus the compaction. That makes the log read as if the agent slept instantly; passing the real wait would make it accurate.
4. [note] Ask 6 ("log ready: <branch> <sha>" and "needs restart") is not in the diff and could not be checked here. The two commits 16943da65 and 95927b66c are in place.
5. [note] The diff also fixes something nobody asked for: `rss_mb = null` after a memory restart (Agents.js:2117). It is small, has its own test and is documented, so it can stay.

## Requirements
- 1 "over 100k, or 50% of the window, whichever is lower; per role in roles.js compact_after; /compact first, then sleep" — yes — `sleep_compact()` takes `Math.min(after.sleep ?? host ?? env ?? 100k, window/2)` (Agents.js:1457-1464). `sleep("idle")` hooks it (Agents.js:1335), and `compact_done` sleeps afterwards (Agents.js:2120). roles.js sets `MASTERMIND_COMPACT.sleep: 100000`.
- 2 "while the cache is still warm if possible" — yes — it runs at the sleep moment, after the 3-minute (or 30 s, or 0) idle wait, which is inside the 5-minute cache TTL. Waits longer than 5 minutes compact cold, and dormant.md says so.
- 3 "Measure the cost of one compaction" — yes — $0.24 / 61 s for 158k → 17k, and $0.08 for 57k → 5k (dormant.md). See note 1.
- 4 "Minions and the standing front desk stay excluded" — yes — `compact_after === null`, the `STANDING` regex and `one_shot` all return false. The test covers minion, master-assistant, assistant-* and fork.
- 5 "Update dormant.md and the compaction doc as conclusions" — yes — both docs now carry a conclusion section, and the dormant.md summary line at the top is corrected (it used to say 200k).
- 6 "Worktree, test, review, log ready + needs restart" — partly verifiable — the work is in a worktree, and `node Servex/agents/compact-before-sleep.test.mjs` passes 23/23 (re-run here). The ready log is not visible (note 4).

Checked for breakage: a second compaction cannot loop. `compacted_turn === turns` holds because `result()` routes to `compact_done` before `turns += 1`. A sleep is never doubled: if the register hook's `maybe_sleep` puts the agent to sleep inside `compact_done`, the later `sleep("idle")` fails on `state !== "idle"`. A message that arrives during the compaction leaves the agent working, and the test covers that. `sleep("landed")` and `sleep("compacted")` skip the hook.

Simpler way: none clearly better. The hook is one line in `sleep()` plus one decision method that mirrors `oversized()`.

## Words
- Docs are plain and conclusive, and they name the rule, who is left out, when it runs and the cost — yes — Servex/doc/dormant.md "Compaction", Servex/agents/doc/owner-2026-10-16-compaction.md.
- No `[fix]`-level wording problems.
