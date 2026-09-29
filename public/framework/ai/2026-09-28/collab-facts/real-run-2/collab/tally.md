# In this repo's sub-mastermind process, is it a hard rule or just a strong convention that: (a) card_reply must always be two or three plain sentences, (b) a task mastermind may never spawn a second task mastermind, and (c) every merge must go through Server/merge.mjs rather than a plain git merge? Where do real edge cases make one of these bend?

**Winner:** sonnet-z — `public/framework/ai/2026-09-28/collab-facts/real-run-2/collab/sonnet-z/4-revise.md`
**Rule:** most votes
**Run cost:** $1.6258

## Facts
- **settled** card_reply's length is task-specific, not universal. The read-peers phase asks for 'one or two plain sentences per peer'; no other phase specifies a range.
- **settled** No rule in the codebase says card_reply 'must always be two or three plain sentences' as a universal constraint.
- **settled** A task mastermind may NOT spawn a second task mastermind yet, but this is conditional: 'depth stops at two UNTIL one measured run proves a three-deep tree can report failure upward' (sub-mastermind SKILL.md line 89).
- **likely** The no-nesting-yet rule is experimental, not foundational—it exists because the claim has never been tested, not because nesting always breaks.
- **settled** Server/merge.mjs is 'the one serialized way to land a worktree' (its header line 1–2), preventing two merges from running at once via a lock file.
- **settled** Server/merge.mjs itself runs 'git merge --no-ff' for clean merges with no overlapping uncommitted work in the main tree (line 350).
- **settled** The review gate in merge.mjs (line 85+) is a GATE, not a mandate to use merge.mjs for all merges—it only refuses branches sized 'light' or 'full' that lack a review.
- **likely** A merge of size 'none' (only CSS or docs, 20 lines or fewer, no new file—per review.md line 60–61) bypasses the review gate entirely and presumably could use plain git merge.
- **settled** Card_reply's length bends in every phase after read-peers: brief/revise/vote/names/implement phases give no sentence limit, only content direction.
- **settled** The no-second-mastermind rule bends when a measured run proves a three-level tree can report failure upward—this is explicitly the intended exit ramp.
- **likely** The merge-via-merge.mjs rule bends for size 'none' (review gate skipped), and merge.mjs itself delegates to 'git merge --no-ff' when there's no conflict.
- **settled** card_reply text for direct questions should be one or two sentences maximum, rarely three — a confirmation, never substantive explanation. Substantive replies go on board cards as Note: prefixed entries, not in chat replies.
- **settled** A task mastermind may never spawn a second task mastermind as of now. Depth stops at two (mastermind → minions, never mastermind → mastermind → minions) until one measured run proves a three-deep tree can report failure upward.
- **settled** The two-level depth rule is explicitly conditional: 'until one measured run proves a three-deep tree can report failure upward'. It is the current guard, not a permanent architectural law.
- **settled** A minion or sub-mastermind must never commit to the main branch or push. They work in a worktree, commit on their own branch, and hand the owner a branch name and diffstat. The merge step — running Server/merge.mjs — is the owner's responsibility, not the agent's.
- **settled** Server/merge.mjs is the MECHANISM that lands branches — it reads task.jsonl, checks the review gate, and merges. Plain git merge is not forbidden; git merge is just not the agent's step to run. The process IS enforced: a minion that tries git merge on main breaks the shared tree.
- **settled** In a worktree branch, a sub-mastermind IS allowed to commit and may be required to. The 'never commit' rule applies only to the main branch. A worktree is isolated, so commits there do not touch shared state.
- **settled** When a substantive explanation is needed (not just a yes/no or confirmation), put it on a board card as a Note: entry, not in the chat reply. The reply itself stays to one line pointing at the card.
- **likely** A sub-mastermind spawning minions for a task is normal and required. The 'never spawn a second mastermind' rule blocks nested masterminds (a mastermind spawning another mastermind for a sub-task), not minions spawning minions.
- **open** The sub-mastermind SKILL.md says a Landed report is 'one screen' of plain sentences with links, and says numbers stay in the log; it never states a two-or-three-sentence rule for card_reply specifically, so that exact wording is likely a convention enforced elsewhere (e.g. the mastermind/every-prompt tier docs), not something found as a hard rule in these two files.
- **settled** The SKILL.md's Never list states plainly: 'spawn another task mastermind (depth stops at two until one measured run proves a three-deep tree can report failure upward)' — this is a settled, explicit hard rule with a named condition for when it could change (a measured run proving upward failure-reporting works at three deep).
- **likely** The stated reason for the depth-two cap is about reporting failure upward through a background/nested-agent notification path, not about task scope or quality — so the edge case that would bend it is specifically a proven mechanism for a three-deep tree to surface a failure to the top, not just a 'this task is complex enough to need it' argument.
- **settled** Server/doc/review.md describes Server/merge.mjs as a hard gate: it 'refuses' a light or full branch with no review newer than its last commit, or with an unanswered [fix] finding — this reads as an enforced mechanical rule (a script refusing), not a convention, for branches that are light or full size.
- **likely** review.md's size table lists 'none' (only CSS or docs changed, 20 lines or fewer, no new file) as reviewed by nobody — implying the merge.mjs gate's review requirement is naturally moot for none-size changes, since there is no review to be newer than the last commit; this is the one clearly legitimate edge where 'every merge needs a review' does not bite, though the doc doesn't say merge.mjs explicitly special-cases it.
- **open** review.md never mentions a plain 'git merge' as an alternative path at all, and describes merge.mjs purely in terms of what it refuses and reads (task.jsonl) — there is no stated escape hatch or override for skipping merge.mjs in favor of a plain git merge, so nothing in these two files shows where that rule bends; it may simply be absolute within this doc's scope.
- **settled** review.md states the task mastermind may lower the review size only with a logged '--why self-evident: <one line>' reason, while raising the size needs no reason — this is a settled asymmetric rule, and it's the clearest example in the doc of a place a strict-sounding classification (size) is explicitly allowed to bend, with the exact condition for bending spelled out.
- **settled** review.md is explicit that the four-turn review process has 'one round of holds only — turn 4 is the last word, there is no turn 5,' which is a settled hard rule about the review flow (though separate from the merge-mechanism question).
- **open** review.md flags its own turns model as built for exactly one finding pass per task, and calls a genuine second full review pass after settlement 'a known limit, not a defended-against case' — this is an admitted edge case where the review/merge machinery does not have a clean rule yet, rather than a place the rule is known to bend safely.

## Votes
- sonnet-z: 2 vote(s), $0.6834
- haiku-x: 1 vote(s), $0.4663

## Caveats
- haiku-x: Both are solid, but sonnet-z better captures what the rules *fundamentally mean*: (a) is a style discipline enforced by routing substance elsewhere, not by counting sentences; (c) is really 'no agent runs git on main'—a principle sonnet-z articulates clearly. Also cites line numbers (8-13, 49-52, 85-94) and shows verification work. Haiku-y's summary table is useful, but sonnet-z's nuance on (a)—'the tool's stated ceiling vs what roles actually ask for'—is sharper.
- haiku-y: The answer is thorough and shows intellectual honesty by acknowledging corrections, but the length makes it harder to reference quickly—haiku-x's table format would help readers find a specific rule faster.
- sonnet-z: Both are essentially equivalent in conclusions and sourcing; haiku-x edges it for citing Server/collab.mjs concretely for the read-peers phase wording rather than just asserting it, but it should double-check the 'or --main' flag is also a review-gate skip alongside --no-review, since it lists only --no-review in its escape-routes list.
