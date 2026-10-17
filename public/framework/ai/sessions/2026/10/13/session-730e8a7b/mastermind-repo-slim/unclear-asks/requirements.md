# The 151 unclear asks: a second look with a tighter question, then the rest become tasks or get retired

Budget: $7 (about $4 of it Haiku). Load the `sub-mastermind` and `code` skills. Your log is this dir's `task.jsonl`.

**Where it stands** (after `../verify-undone/`, 10-17 11:02): of 620 undone asks, Haiku found 240 built, 229 undone (now idle tasks, `../undone-to-tasks/`), and **151 unclear**, meaning it could not tell whether the ask was done. The owner's theme: asks never done must be findable and tracked (`../requirements-15.md`).

**What exists:**
- `Server/UndoneVerify.mjs`: batches, the evidence rubric, `--merge` by ask id.
- `Server/UndoneToTasks.mjs`: `--plan`/`--apply`, undone asks → idle tasks.
- `ai/asks/undone.json`: each ask's `verified` and `evidence`.
- Page `/framework/ai/asks/undone/`; verdict doc `ai/doc/undone-asks-2026-10-17.md`.

CLAUDE.md: "One specific question per step".

## Deliverable

1. **Read why they were unclear**: group the 151 by the reason in their `evidence` (the ask is too vague to check; the ask names a thing that no longer exists; the ask is an opinion or a question, not work; the Haiku ran out of places to look). Print the counts; that grouping is the measurement and goes in your log and the doc.
2. **Second pass, one question each**: `UndoneVerify.mjs --only unclear --question <kind>` (add the two flags) writes batches of about 20 where each ask carries ONE specific question for its group ("does `<path>` exist and do what the ask says: yes/no with the line" for the first group; "is this a work item at all: yes/no" for opinions; and so on). Run the Haiku minions (at most 6 at once, each under 60k tokens, each reading only its batch and the files it names), `--merge`, and spot-check ten verdicts; log how many were right per kind.
3. **Route what is left**: asks now `undone` go through `UndoneToTasks.mjs --apply` (they become idle tasks with the manifest); asks now `done` keep their evidence; asks that are not work items get `verified: "retired"` with the reason (never deleted; they stay on the page under a "not work" filter); asks still unclear after two passes get `verified: "needs-owner"` and a one-line question each in the verdict doc, grouped, so the owner can answer ten at a time by voice. Two numbers that must agree in your log: 151 = done + undone + retired + needs-owner.
4. The page shows the new verdict kinds in its filter; the verdict doc gets a dated section with the counts and the needs-owner questions. `check_page` at 400 and 1200; worktree, `merge.mjs` (`--no-review` naming your review if the gate cannot see this 2026-10-13 task dir), a `finish` line with the counts checked with `tail -1`, `git status` clean (batches and results committed as records); `card_reply` on `2026/10/16/checkup-on-everything-the-voice-sessions` with the counts. Never restart servers; never drive the owner's tabs.

Fence: `Server/UndoneVerify.mjs` (the two flags), `Server/UndoneToTasks.mjs` (read; run), `ai/asks/**`, the verdict doc (a new section), the new task folders through the tool, this task dir.
