# pid-accounting: is every process we start logged, attributed and ended?

Branch `worktree/pid-accounting`, commit `08d1c600f`. Not merged — the parent (`mastermind-resources`) merges.

## 1. Coverage, last 24 h (`node Servex/pid-coverage.mjs`)

1,478 start lines in the window; the per-kind rows sum to 1,478 (agree). `Servex/pid-coverage-report.md` is the committed output; rerun any time, the window moves.

| kind | starts | with end | with agent+session |
|---|---|---|---|
| claude.exe | 33 | 81.8% | 100% |
| node | 479 | 99% | 11.7% |
| git | 498 | 99.4% | 15.5% |
| powershell/bash | 184 | 97.8% | 69.6% |
| chrome (playwright) | 16 | 100% | 100% |
| other | 268 | 99.3% | 38.1% |

Ending is near-universal everywhere. Attribution (agent **and** session both set) is only ~12–70% outside claude.exe/chrome — expected, not a bug: a line that only reaches the `spawns` log (no agent in context) is correctly 0% there, and `node`/`git`/`other` are mostly Lineage-sampled grandchildren walked up to their nearest tracked ancestor, which the sample sometimes misses within its own cap.

## 2. Short-lived misses

~150 shell starts were Lineage-sampled (`"seen":"sample"`, kind `powershell/bash`) in 24 h, against ~3,280 Bash/PowerShell tool calls made by agents in the same window (counted from the transcripts' `"name":"Bash"`/`"name":"PowerShell"` tool-use lines — the cheaper source, `grep -oc` over the 18 transcript files modified in the last 24 h across the three active `~/.claude/projects/*` dirs). **About 1 in 22 is ever seen.** A shell under Lineage's 10 s sample interval cannot leak (it is gone before the next diff), so this is a visibility gap, not a leak risk.

## 3. The CLI-minion bypass

Checked `73e88e75`, `d2507b09`, `00c47a44`, and `1acd3902` (session-truth's) by `git grep --untracked` over the session logs.

- **`1acd3902` is a normal minion**, not a bypass: it has an `assign` line, worktree `qf-2`, and its own `claude.exe` pid line with agent+session set. No issue.
- **`73e88e75` and `d2507b09`** were launched by `mastermind-page-design` as "CLI minions" when `spawn_agent` was refused ("no pool worktree ready"). Their session folders hold only `cache.jsonl`/`index.json` (built later from the transcript) — **zero pid lines anywhere**, for the whole life of either process: no start, no end, no agent/session attribution.
- **`00c47a44`** used the same recipe but ran `TaskDirs.mjs` itself, so it got a real task folder and shows on the dashboard — but **still no pid line** for its own `claude.exe` or any child.
- **None are still running**: their transcripts stopped updating hours ago (04:26, 04:32, 05:50) and no live `claude.exe` matches any of the three ids.
- **Where the launch happens:** `Servex/agents/roles/mastermind.md` line 60, "Fallback when Servex is down" — a documented `claude -p …` recipe. It is meant for Servex being unreachable (nothing would be sampling anyway), but `mastermind-page-design` applied it to an ordinary `spawn_agent`/`take_worktree` **refusal**, where Servex is up and the right move is to retry or queue. Because this path starts a `claude.exe` Servex's `owners` map never learns about, Lineage's ancestor walk can never attribute it or its children — it is invisible by construction, not by a logging bug.

## 4. The fix (commit `08d1c600f`, worktree `pid-accounting`)

Chose: **restrict the fallback's wording**, not add logging to it. `Servex/agents/roles/mastermind.md` now scopes the recipe to "Servex itself cannot be reached" and explicitly forbids it for a `spawn_agent`/`take_worktree` refusal, pointing at retry/queue instead. `Servex/doc/processes.md` gets a new "Coverage, and the two gaps that log nothing" section documenting both this and the short-lived-sampling gap (§2), with the numbers above.

**Alternative considered and rejected:** making the launcher itself log a start line. Rejected because there is no single launcher script — the recipe is run by hand from a mastermind's own Bash tool, so "logging the launch" would mean teaching Lineage to recognize a `claude -p` it never saw start, which is a much bigger, unproven change for a $3 budget; the actual bug is that the recipe gets reached for the wrong trigger, not that it fails to log once reached for the right one.

Also added: `Servex/pid-coverage.mjs` (+`pid-coverage.test.mjs`), and exported `read_lines`/`repo_root` from `leaks.mjs` so the new script could reuse them instead of copying.

## 5. Still running with no owner

None found. `node Servex/leaks.mjs --json` → `{"done":0,"working":6}`: zero processes whose owning agent/task is stopped or landed while the process is still alive. Separately checked every live `claude.exe` (11 total) against every logged pid: 9 are the owner's own Claude desktop app (`WindowsApps\Claude_*`, started 2026-11-05 — never ours, per the role rule) and the other 2 are Servex-tracked sessions with pid lines already. **Never killed anything; list only, as instructed.**
