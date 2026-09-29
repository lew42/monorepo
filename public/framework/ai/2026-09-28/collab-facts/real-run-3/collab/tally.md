# In this repo, when a merge into michael/dev needs a before-and-after screenshot (shared CSS changed) versus when it doesn't, and whether an agent may ever skip node Server/merge.mjs's review gate for a light-sized change if it is confident the change is safe — where is this a hard rule versus the mastermind's own judgment call?

**Winner:** sonnet-r — `public/framework/ai/2026-09-28/collab-facts/real-run-3/collab/sonnet-r/4-revise.md`
**Rule:** most votes
**Run cost:** $1.4402

## Facts
- **settled** Screenshots at 1280, 1920, 3440 are required ONLY for a 'full' size review: when a new page, module, tool, or Servex change exists. Light (code, no new page) and none (CSS/docs ≤20 lines) skip screenshots.
- **settled** Server/merge.mjs ALWAYS enforces a review gate: it refuses any light or full branch that lacks a review newer than its last commit, or carries unanswered [fix] findings. This is non-negotiable.
- **settled** A merge requires a review UNLESS the change is 'none' size: CSS or docs only, 20 lines or fewer, and no new file. No review → no gate for 'none' size.
- **settled** Only the task mastermind may lower the review size (e.g., from full to light, or full to none), and only by running --why 'self-evident: <one line>' to document the override in the log. A minion agent cannot unilaterally skip the gate.
- **settled** A review of the branch head OR any commit the head descends from satisfies the gate. Once a review passes, new commits that only apply fixes can land without a second review round.
- **likely** If CSS changes are shared across pages (not localized), the change may exceed 20 lines and move from 'none' to 'light' size, triggering a review but NOT screenshots — only the code diff is reviewed by Sonnet, not visual output.
- **settled** The 'self-evident' override is the mastermind's judgment call. It is not a hard rule that certain changes always skip; it is discretionary and recorded, so decisions are auditable.
- **settled** No agent (minion, mastermind, or reviewer) can skip the merge gate by claiming confidence. The gate is a process, not a safety check that skill can waive.
- **settled** Size 'none' (CSS or docs only, ≤20 lines, no new file) requires nobody's review — the merge gate passes without any review at all
- **settled** Any change size 'light' or 'full' requires a passing review or the merge gate refuses, loudly
- **settled** Screenshots at 1280, 1920, 3440 are required only for size 'full' (new page, module, tool, or Servex change) — not for 'light' and definitely not for 'none'
- **settled** A shared CSS change is size 'none' if it's ≤20 lines and touches no new file; otherwise it's 'light' or 'full' depending on what it affects
- **settled** Shared CSS changed never automatically triggers a screenshot requirement; screenshots depend on the size category, not the file type
- **settled** A [fix] finding with no answer yet blocks the merge gate, even if review passes for all other findings
- **settled** The task mastermind may lower a computed size category only with --why "self-evident: <reason>" at review time, logged as a decision line
- **settled** The merge gate can be skipped with --no-review "why", but the gate prints !!! loud warnings and the reason is recorded
- **likely** Skipping the review gate with --no-review is technically allowed, but the warnings suggest it is rare and only for exceptional cases
- **likely** Whether an agent should lower size, skip review, or rely on self-evident reasoning is a mastermind's judgment call, not an agent's unilateral decision
- **settled** The review gate is hard when size is 'light' or 'full' (always refuse without review); the decision to lower size or invoke --no-review is the mastermind's discretion
- **settled** A review older than the branch's head (unless that head descends from the review's head with all fixes answered) blocks the merge
- **settled** review.md fixes review size by what changed: 'none' (CSS/docs only, <=20 lines, no new file) needs no review, 'light' (code changed, no new page/module/Servex part) gets a fresh Sonnet, 'full' (new page/module/tool/Servex change) gets a fresh Opus plus screenshots at 1280/1920/3440.
- **settled** Server/merge.mjs always refuses to merge a 'light' or 'full' branch that has no review newer than its last commit, or that has any [fix] finding with no answer yet — this is a hard, mechanical gate, not a judgment call.
- **settled** Nothing in review.md or merge.mjs's behavior lets an agent skip the review gate for a light-sized change by being confident it's safe — an agent may never bypass node Server/merge.mjs's gate on its own authority.
- **settled** Only the task mastermind may lower a review's size, and only by passing --why "self-evident: <one line>" to review.mjs, which is logged as a {"decision":...} line — raising the size needs no reason. This is the one place judgment enters, and it belongs to the mastermind, never a minion or the author.
- **open** review.md ties screenshots (1280/1920/3440 + UX questions) to the 'full' size tier (new page/module/tool/Servex part), not specifically to 'shared CSS changed' — I found no explicit rule in review.md or Server/doc/review.md that a shared-CSS change always requires a before/after screenshot regardless of size.
- **likely** A change that touches only CSS or docs, at or under 20 lines, with no new file, qualifies for review size 'none' — likely including some shared-CSS edits, unless the mastermind judges the CSS change large/risky enough to raise the size (raising size needs no justification).
- **likely** Whether a shared-CSS change is risky enough to warrant a before-and-after screenshot (beyond whatever the size tier already requires) reads as the task mastermind's own judgment call, not a hard rule stated anywhere in the two files read.
- **settled** Always: the reviewer in turn 1 (and turn 3's reply reviewer) is a fresh agent that never saw the author's own conversation — self-review is never a substitute for this.
- **settled** Every [fix] finding always needs an answer of 'fixed' or 'declined' before the merge gate opens; a [note] finding may also use the lighter 'noted'.
- **settled** Never more than one round of holds: turn 4 (the mastermind's ruling) is the last word — there is no turn 5.
- **settled** merge.mjs accepts a review of the branch's current head OR of any earlier commit that head descends from, so new commits that only apply an already-reviewed fix can land without a second review round — this is a stated exception to needing a fresh review, not a loophole for skipping review entirely.

## Votes
- sonnet-r: 2 vote(s), $0.5942
- haiku-p: 1 vote(s), $0.3056

## Caveats
- haiku-p: Add one sentence explicitly naming the principle: 'Visual impact, not CSS scope, determines whether a mastermind would raise size' — sonnet-r's four scenarios imply this but haiku-q states it clearly as a principle, which helps a reader understand the reasoning.
- haiku-q: haiku-p's table format is clearer, but it incorrectly names `merge.mjs` for the --why flag; lowering size happens via `review.mjs`, not `merge.mjs`. sonnet-r avoids this error by not specifying the command, but should name it explicitly: 'the mastermind lowers size by running `review.mjs` with `--why`'
- sonnet-r: cite Server/merge.mjs by line number the same way it cites review.md, rather than only naming the file for the --no-review flag
