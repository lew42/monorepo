Budget: $4.

# Servex: find the slowest common path and make it faster

The owner's words (via vscode-mastermind, 2026-10-03): "the system mastermind should be automatically managing the performance of everything: do a quick performance audit and update its own system, not excessive about auditing, but think about ways to speed things up when they're slow, especially the slowest things done most often: the low-hanging fruit."

Cut to three paths (vscode-mastermind's review of 2026-10-03; the week is over pace). Servex restarts and card-to-tab time are left for a later run of the same script.

## 1. Measure three common paths, from logs that already exist

Write one node script, `Servex/perf.mjs`, that reads the real logs (law 7: never estimate from memory) and prints, for each path: the median time, the slowest 10%, and how many times it ran in the last 7 days.

- **Spawn → first result:** a spawn line in a task.jsonl or the Servex log, to the agent's first result line.
- **Quick fix → merged → live:** `quick_fix` taken, to the merge commit, to the page serving it.
- **merge.mjs smoke time:** how long the smoke test inside a landing takes.

If a path leaves no timestamps, add the one log line it needs and say so; don't guess its time.

## 2. Rank and fix the top one

- Rank by **median time × runs per week** (the total time lost per week). Print the table.
- Fix the top path, the low-hanging fruit only: one change with a clear before and after. Then re-run `perf.mjs` and show both numbers.
- List the next two as queue entries in `public/framework/ai/servex-queue.json`, each with its measured cost. Don't build them.

## 3. Make it a standing duty

Add one line to `.claude/skills/servex-mastermind/SKILL.md`: "About once a day, run `node Servex/perf.mjs`; if the slowest common path got worse or a new one tops the list, queue one fix for it. Don't audit more than that." Write and Edit can't touch `.claude/`, so do it with a small node patch script (dry-run first).

## Land

- `node --check` each changed file, and test what you changed.
- Commit by exact path and merge.
- Post the ranked table and the before/after on the card, in plain words ("a spawn took 48 s to its first result; now 20 s").
- Append an `experiment` line with both measurements.

Sonnet, high effort. Never `stash`, `checkout --` or `reset` in the main tree. Don't wait on the owner.
