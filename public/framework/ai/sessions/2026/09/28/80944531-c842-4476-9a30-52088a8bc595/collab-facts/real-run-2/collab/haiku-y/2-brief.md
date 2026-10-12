# Rules vs. Conventions in the Sub-Mastermind Process

## (a) card_reply must be two or three plain sentences — Settled convention (not hard rule)

The pattern across the system is consistently **one or two sentences**, not 2–3. The `.claude/skills/every-prompt/cards.md` specifies the fast assistant's card format as `"<two short sentences: what was asked, who has it>"`. The `assistant-layers` requirements (2026-09-24) show this enforced across three roles:

- Card assistant: "always one short `card_reply` so the owner is never met with silence" + "pass the result to the owner in one or two sentences on the card"
- Master assistant: "stay silent unless it earns one or two sentences"
- Servex mastermind: "report to the owner on the `live` card with `card_reply`" (context suggests brief replies)

**Verdict:** "One or two sentences" is the settled convention. Two or three is a looser interpretation. The rule exists to keep replies crisp and prevent card clutter—anything substantive goes on a separate board card instead.

**Edge case:** Substantive explanations (decisions, context) belong on a "Note:" board card, not as a card_reply. The reply stays to one line pointing at the card.

---

## (b) A task mastermind may never spawn a second task mastermind — Conditional guard, not permanent

The sub-mastermind SKILL.md lists this in the "Never" section but immediately qualifies it with a parenthetical condition:

> "spawn another task mastermind (depth stops at two **until one measured run proves a three-deep tree can report failure upward**)"

This is **explicitly conditional**. It is the current guard against nesting complexity until proven safe through measurement. The rule awaits evidence that three-deep hierarchies can handle failure reporting correctly. It is not a permanent architectural constraint.

**Verdict:** Hard rule today, awaiting revocation. Once a measured run proves three-deep works, this "Never" moves to "May" with caveats.

**Edge case:** A mastermind spawning minions is normal and required—the rule blocks nested *masterminds*, not minions spawning minions.

---

## (c) Every merge must go through Server/merge.mjs rather than plain git merge — Process rule, not absolute prohibition

The Server/merge.mjs source code shows that **merge.mjs itself uses `git merge --no-ff`** internally (line 25: "No overlap: `git merge-tree` proves the merge is clean, then `git merge --no-ff` commits it"). The rule is not "never use git merge"—it is "the agent never runs git commands on main; merge.mjs is the standardized landing mechanism."

What merge.mjs provides:
- Review gate (fresh-eyes-review checks)
- Smoke test (links, new pages, no 404s)
- Safe three-way merge for overlaps
- Live-reload hold during landing
- Lock to prevent concurrent merges
- Guard against running over uncommitted work

**Verdict:** Hard rule for agents (never commit/push/merge), standard process for landing (merge.mjs). Plain git merge is not forbidden; it is the system's responsibility, not the agent's.

**Edge case:** Worktree branches may require commits by the agent (normal and safe). The "never commit" rule applies only to the main branch. The merge itself is the owner's/system's step.

---

## Summary table

| Rule | Certainty | Bends where | |
|------|-----------|-------------|---|
| (a) card_reply 2–3 sentences | Convention (strong) | Substantive content goes on board Note: cards | "One or two" is the stated pattern |
| (b) Never spawn second mastermind | Conditional guard | Three-deep pending measurement run | Awaits evidence to lift |
| (c) All merges via merge.mjs | Process rule for agents | Worktree commits safe; merge.mjs runs git merge | Rule blocks agent merges, not git merge itself |

---

## Sources

- `.claude/skills/every-prompt/cards.md` (fast assistant card format)
- `.claude/skills/every-prompt/tiers.md` (tier responsibilities)
- `.claude/skills/sub-mastermind/SKILL.md` (the Never list and conditional note)
- `public/framework/ai/2026-09-24/assistant-layers/card-requirements.md` (card_reply usage across roles)
- `public/framework/ai/2026-09-24/assistant-layers/global-requirements.md` (master assistant and mastermind-servex briefs)
- `Server/merge.mjs` (merge.mjs implementation showing git merge usage)
- `Server/doc/review.md` (review gate and merge.mjs refusal rules)
- `public/framework/ai/handover.md` (worktree teardown mentioning git merge --no-ff)
