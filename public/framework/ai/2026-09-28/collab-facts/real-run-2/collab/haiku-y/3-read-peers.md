# What peers found

**sonnet-z:** Found that the "two or three sentences" constraint is stated in the card_reply tool's own description in `Servex/agents/Assistant.js`, not just in docs—making it stronger than a loose convention at the tool-contract level. Also discovered the constraint is unenforced by the handler and inconsistently quoted across different agent prompts (1–2, 2–3, 2–4), so it's a strong style guide that visibly bends in practice.

**haiku-x:** Traced "two or three sentences" back to the every-prompt tier docs (`SKILL.md`, `headless.md`, `mastermind/SKILL.md`), showing it is NOT a sub-mastermind rule but a UI-tier convention that varies by phase (collab's read-peers phase asks for "one or two"). Also found the explicit `--no-review "why"` escape hatch in merge.mjs (lines 8, 49, 92) that bypasses the review gate with a loud warning, which I missed entirely.

Both found that (b) is hard/conditional and (c) has real bends, but sonnet-z and haiku-x pinpointed where the stated rules actually live in code—the tool definition and the tier docs—and what the real escape hatches are. I missed the Servex tool definition and the --no-review flag.
