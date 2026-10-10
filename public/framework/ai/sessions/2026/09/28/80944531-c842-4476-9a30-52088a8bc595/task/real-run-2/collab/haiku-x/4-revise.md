# Revised Answer: Three rules and where they bend

## (a) card_reply must always be two or three plain sentences — Convention with tool-level enforcement, inconsistently interpreted, not code-enforced

The "two or three plain sentences" instruction is real but lives at the **MCP tool level**: it's embedded in the `card_reply` tool's description in `Servex/agents/Assistant.js` ("Two or three plain sentences; the reader is glancing, not reading code"), which means every agent that can call the tool sees this instruction as part of the tool contract itself—stronger than a loose skill-file convention.

However, the actual pattern across different agents is inconsistent. The stated count varies:
- `mastermind-servex.md` and `card-assistant.md` both specify "one or two plain sentences"
- `Dispatcher.js` and some helper agents say "two plain sentences" or "two to four"
- The most common pattern in requirements is actually "one or two," not "two or three"

The code doesn't enforce the rule: the `card_reply` handler only checks that `card` and `text` are both present—nothing counts sentences or truncates a longer reply.

**Where it bends:** The rule bends when substantive content is involved. The edge case is that explanations (decisions, context, caveats) should go on a separate "Note:" board card, not squeezed into the card_reply itself. The reply stays to one line pointing at the card. Different agents interpret the sentence count differently despite the tool contract, making "one or two" the more accurate pattern than "two or three."

---

## (b) A task mastermind may never spawn a second task mastermind — Hard rule awaiting measurement

The sub-mastermind SKILL.md line 89 lists this in the "Never" section with an explicit condition: "spawn another task mastermind (depth stops at two **until one measured run proves a three-deep tree can report failure upward**)".

This is a **hard rule today**, not a soft convention. The stated reason is mechanical: background agents' completions notify the main session, not their parent, so a three-deep tree currently has no proven way to report failure upward. The rule is not foundational—it awaits specific evidence to lift it.

**Where it bends:** The rule bends the moment a measured run proves a three-level tree can report failure correctly back to the top. This is the intended exit ramp, documented in the same sentence that imposes the rule. Nothing here bends in practice yet; it's a known limit waiting on a specific proof.

---

## (c) Every merge must go through Server/merge.mjs rather than plain git merge — Hard-gated process with multiple escape routes

`Server/merge.mjs` is "the one serialized way to land a worktree" (its header comment), and it enforces this with a lock file preventing concurrent merges. The review gate (enforced by merge.mjs) refuses `light` or `full` sized branches without a review newer than the last commit and with every `[fix]` finding answered.

However, the rule has **multiple documented escape routes**:

1. **The `--no-review "why"` flag** (Server/merge.mjs lines 8, 49, 92): explicitly bypasses the review gate with a loud warning
2. **Size "none" exemption** (CSS/docs only, 20 lines or fewer, no new file): skips the review gate entirely because there's no review pipeline expected in the first place
3. **merge.mjs itself delegates to `git merge --no-ff`** for clean, non-overlapping merges—it is a wrapper controlling *when* and *how* git merge runs, not a replacement for it

**Where it bends:** The most complete bend is size "none," which is moot for review-gating because the scope (CSS/docs only) never enters the review pipeline. The `--no-review` flag is an explicit override that works but prints warnings. Worktree commits by agents are normal and safe; the "never commit/push/merge" rule applies only to the main branch and to direct merges—not to the entire merge process, which is ultimately the owner's or system's responsibility.

---

## Summary

| Rule | Nature | Enforces | Bends where |
|------|--------|----------|------------|
| (a) card_reply length | Tool-contract convention | Tool description, not code | Inconsistent across agents ("one or two" more accurate than "two or three"); substantive content goes on Note: cards |
| (b) Never spawn second mastermind | Hard rule, conditional | "Never" list with stated lift condition | Explicitly when measurement proves three-deep works |
| (c) All merges via merge.mjs | Hard process gate | Lock + review gate + smoke test | `--no-review` flag, size "none" exemption, worktree commits allowed |

---

## Sources

- `Servex/agents/Assistant.js` (card_reply tool definition with "two or three sentences" instruction)
- `Servex/agents/mastermind-servex.md`, `Servex/agents/card-assistant.md` (role-specific wordings: "one or two")
- `Servex/agents/Dispatcher.js` (differing sentence counts)
- `.claude/skills/every-prompt/cards.md` (fast assistant card format specifying "two short sentences")
- `.claude/skills/every-prompt/SKILL.md` (voice mode guidance)
- `.claude/skills/sub-mastermind/SKILL.md` (the depth-two rule)
- `public/framework/ai/2026-09-24/assistant-layers/` (card_reply requirements across three roles)
- `Server/merge.mjs` (merge.mjs implementation, lock, review gate, `--no-review` flag)
- `Server/doc/review.md` (review gate, size table, merge.mjs refusal rules)
- `Server/collab.mjs` (phase-specific sentence guidance in prompts)
