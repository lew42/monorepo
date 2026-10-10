# Rules vs. Conventions: Revised — Three rules, where they actually bend

## (a) card_reply "two or three plain sentences" — stated at the tool level, unenforced

The "two or three" constraint is **real and stated**, but located at a higher level than I initially found: the card_reply tool's own description in `Servex/agents/Assistant.js` bakes it into the tool contract itself ("Two or three plain sentences; the reader is glancing, not reading code"). This makes it stronger than a loose convention—every agent that can call the tool sees this instruction.

**But it is not mechanically enforced.** The handler only checks that `card` and `text` are both present; nothing counts sentences or truncates. And the exact phrasing varies across agents: `mastermind-servex.md` and `card-assistant.md` both say "one or two," while `Dispatcher.js` and other prompts say "two" or "two to four." The collab system itself shows phase-specific variation: the `read-peers` phase asks for "one or two plain sentences per peer" (found in `Server/collab.mjs`).

**Verdict:** A strongly stated house style embedded in the tool contract, with zero enforcement and inconsistent interpretation across roles. It is the kind of rule most likely to visibly bend in practice because the contract says "two or three" but different agents reasonably interpret it as "one or two" or "up to four" based on context.

**Edge case:** The collab's read-peers phase explicitly asks for "one or two," showing variation by phase and agent role.

---

## (b) Never spawn a second task mastermind — hard rule with explicit lift condition

The sub-mastermind SKILL.md line 89 states this as an absolute in the "Never" list: "spawn another task mastermind (depth stops at two until one measured run proves a three-deep tree can report failure upward)."

The mechanical reason is given: a nested background agent's completion notifies the *main* session, not its parent, so there's no proven path for failure to bubble up a three-level tree. This is written as an absolute constraint with a single, specific condition that would lift it—not a soft preference or a known workaround.

**Verdict:** A hard constraint awaiting experimental evidence. No edge cases found yet; it's a known architectural limit, not a rule that bends in practice.

---

## (c) Every merge through Server/merge.mjs — hard for light/full, with escape hatches

The merge.mjs script header describes itself as "the one serialized way to land a worktree" and enforces a review gate: `Server/doc/review.md` states that merge.mjs refuses a `light` or `full` branch if it has no review newer than its last commit, or an unanswered `[fix]` finding. This is an enforced script-level gate.

**But the escape hatch is explicit.** The merge.mjs script accepts a `--no-review "why"` flag (lines 8, 49, 92) that bypasses the review gate with a loud warning. This is not a hidden workaround—it's a documented override meant for specific cases (e.g., smoke tests on a scratch repo).

Additionally, size `none` (CSS/docs only, 20 lines or fewer, no new file) is reviewed by nobody and skips the review gate entirely. And merge.mjs itself uses plain `git merge --no-ff` internally for clean merges—it is a wrapper that adds checks and safety, not a replacement for git merge.

**Verdict:** A hard rule for `light` and `full` branches (enforced by script), with an explicit `--no-review` override for justified cases. Size `none` is a legitimate exemption. The rule is not "never use git merge"—it's "use merge.mjs as the standard landing tool, which wraps and safeguards git merge."

**Edge cases:** 
- `--no-review "why"` is an explicit escape hatch
- Size `none` skips review gate entirely
- Worktree commits by the agent are normal and safe

---

## Summary table

| Rule | Type | Where it bends |
|------|------|---|
| (a) card_reply 2–3 sentences | Stated convention, unenforced | Different agents interpret as 1–2, 2–3, or 2–4; collab phases vary |
| (b) Never spawn second mastermind | Hard constraint, conditional | Awaits measured proof of three-deep tree working |
| (c) All merges via merge.mjs | Hard for light/full, soft for none | `--no-review` flag, size-none exemption, worktree commits |

---

## Sources

- `Servex/agents/Assistant.js` (card_reply tool definition and handler)
- `Servex/agents/mastermind-servex.md`, `Servex/agents/card-assistant.md`, `Servex/agents/Dispatcher.js` (inconsistent sentence-count phrasings)
- `Server/collab.mjs` (phase-specific guidance: "one or two plain sentences per peer")
- `.claude/skills/sub-mastermind/SKILL.md` (the depth-two rule and its lift condition)
- `Server/merge.mjs` (merge serialization, `--no-review` flag, git merge --no-ff usage)
- `Server/doc/review.md` (review gate, size-based exemptions)
