# Closing a task: proof and partial completion (options, not built)

**Status: written down 2026-11-06, nothing here is built.** The owner's question (relayed by voice-app): "close with proof" is a question mark, because an AI can make up proof. Tasks may also need partial completion (0.5, 0.8) that averages up into the parent.

## What happens today

- `complete({outcome, evidence})` closes a task at 1. A `complete` with no outcome or evidence still counts as 1, but `tally().unproven` counts it and the session page says how many (`Task.proof_problem`).
- A task scores 0 until it is complete. The only partial number is the mean of the subtasks (`completion_score`, [completion.md](completion.md)), or `step / steps.length` for a task with steps.
- A session's score is the mean of its parts, so a parent already averages up whatever its children score.

## Options for proof

1. **Proof checked by code where it can be.** Evidence that names a commit, a test file or a merge is checked by a script: the commit is on `compliance/dev`, the test passes now. Unchecked evidence stays text. *Catches* made-up hashes and passing claims. *Cost:* one small checker. *Caveat:* most outcomes (a doc, a decision) have nothing to check.
2. **A second agent confirms.** A cheap reviewer reads the outcome against the task and marks it `confirmed` or `doubted`. *Catches* claims that don't match the work. *Cost:* a Haiku call per close. *Caveat:* a model can be wrong the same way twice.
3. **The owner's check is final.** `checked_by` already scores 1 regardless; an owner "no" reopens. *Wins* for anything the owner can see. *Caveat:* the owner rarely reads closes, so most tasks never get it.
4. **Confidence instead of a yes/no.** A close carries `confidence` (high, medium, low, already written by some closers), shown beside the score; it doesn't change the score.

## Options for partial completion

1. **A `progress` number on the task** (0 to 1), set by the agent working on it. It is the task's own score until it is complete. Its parent averages it like any other part. *Caveat:* it is self-reported, so it has the same trust problem as proof.
2. **Steps or subtasks only.** A task gets partial credit only through parts that each close with their own outcome. This is today's rule. *Wins* because each number traces to a closed part.
3. **Close at a fraction.** `complete({outcome, evidence, score: 0.8})` closes the task but scores it 0.8, so the rest stays visible as unfinished. This pairs with "no silent endings" (a close under 1 files what is left).

Leaning (a guess, not decided): option 1 for proof plus partial option 2. Every number comes from something a script can find. Option 3 for partial is next if a single fraction turns out to be needed.

## Also written down: Plan

A **Plan** (a `Process` subclass, `core/Task/Process.js`) waits for approval before it runs. Quick tasks just run. Long or hard ones get a plan first, whose steps run only after an approve. This idea is not built yet; it builds on `Task.wait` / `approve` (`core/Task/Task.js`).
