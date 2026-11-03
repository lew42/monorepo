# Brief: Three rules and where they bend

## The three rules under question

**(a) card_reply must always be two or three plain sentences** — this is a **strong convention**, not a hard process rule. The "two or three sentences" constraint appears three times in the codebase, all in the **every-prompt tier** (the fast assistant): in `every-prompt/SKILL.md` ("Speed is the job: under ten seconds, two or three plain sentences"), `every-prompt/headless.md` ("the answer itself — two or three short, plain sentences"), and `mastermind/SKILL.md` ("A card's text is two or three short sentences at most"). This constraint applies to dashboard **card text**, not specifically to `card_reply` in the sub-mastermind's collab process. The sub-mastermind docs never mention a sentence limit for card replies.

**Where it bends:** The constraint is task-specific to the every-prompt tier. A sub-mastermind writing a brief phase response has no stated sentence limit—only content direction. The collab system's `read-peers` phase asks for "one or two plain sentences per peer," showing variation by phase.

**(b) a task mastermind may never spawn a second task mastermind** — this is a **hard constraint FOR NOW**, but explicitly conditional. The sub-mastermind SKILL.md line 89 states: "spawn another task mastermind (depth stops at two until one measured run proves a three-deep tree can report failure upward)". This is not foundational; it is awaiting experimental evidence.

**Where it bends:** The rule bends as soon as a measured run proves a three-level tree can report failure upward. This is the intended exit ramp, not a permanent limit.

**(c) every merge must go through Server/merge.mjs rather than a plain git merge** — this is a **hard constraint** with an **explicit escape hatch**. merge.mjs is "the one serialized way to land a worktree" (its header comment), preventing concurrent merges via a lock file. However, the script accepts a `--no-review "why"` flag (lines 8, 49, 92) that bypasses the review gate. When invoked with `--no-review`, merge.mjs prints a loud warning but proceeds.

**Where it bends:** The review gate (enforced by merge.mjs) refuses `light` or `full` sized branches without a review, but `--no-review "why"` is an explicit override. Additionally, size `none` (CSS/docs only, 20 lines or fewer) skips the review gate entirely. And merge.mjs itself uses plain `git merge --no-ff` for clean, non-overlapping merges—it is a wrapper, not a replacement, for git merge.

## Summary

- **(a) is a strong convention** from the UI/every-prompt tier, not a sub-mastermind rule; it bends per-phase
- **(b) is a hard constraint pending measurement**; it has an explicit intended exit ramp  
- **(c) is hard with an escape hatch**; `--no-review` and size filters both bend the rule

## Sources

- `.claude/skills/every-prompt/SKILL.md` (lines 16, 22) — fast assistant and card text length
- `.claude/skills/every-prompt/headless.md` (line 19) — headless answer length  
- `.claude/skills/mastermind/SKILL.md` (line 277) — card text length and dashboard convention
- `.claude/skills/sub-mastermind/SKILL.md` (line 89) — nesting depth rule
- `Server/merge.mjs` (lines 1–4, 8, 49, 92) — merge serialization and `--no-review` flag
- `Server/doc/review.md` (lines 60–61, 92–94) — review gate and size-based exemptions
- `Server/collab.mjs` (line 117) — phase-specific sentence guidance ("one or two plain sentences per peer")
