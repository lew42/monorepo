# Session data, complete

Task `session-data-complete-cost-duration-chil` on process-system (the owner, 2026-10-23 ~20:45, via vscode-mastermind).

1. `item({path: <any session>})` answers: total cost (from the transcript, computed incrementally and stamped with where it read to), duration, every child session nested with its own cost, direct and descendant task counts (created, started, complete), and the biggest tasks.
2. It works for VS Code tab sessions (their record replayed as a plain Task, with no cost).
3. The sessions readme states what data exists, which tool writes it, which class reads it.
4. Tested on session-e00f55c9.
5. Find out why it was missing: never written as a requirement, written but not built, or built but not wired (findings.md).
