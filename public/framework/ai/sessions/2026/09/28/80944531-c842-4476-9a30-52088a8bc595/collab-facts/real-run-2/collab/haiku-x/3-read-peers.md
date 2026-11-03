# Read-peers: haiku-y and sonnet-z

## haiku-y

Haiku-y found the key distinction I missed: the actual pattern across the system is "one or two sentences," not "two or three," and they traced this through `.claude/skills/every-prompt/cards.md`, the card-assistant and master-assistant requirements (from 2026-09-24 assistant-layers docs), and across three different roles. They also identified the critical edge case that substantive explanations belong on a separate "Note:" board card, not in the card_reply itself—the reply stays to one line pointing at the card. I should have checked cards.md and the assistant-layers requirements specifically instead of relying only on mastermind/SKILL.md.

## sonnet-z

Sonnet-z found something I completely missed: the "two or three plain sentences" instruction is actually baked into the `card_reply` MCP tool's own description in `Servex/agents/Assistant.js`, making it part of the tool contract itself—far stronger than a loose convention. They also found that the handler doesn't mechanically enforce the count (it only checks presence), and crucially, different agents quote it inconsistently (mastermind-servex and card-assistant say "one or two," while Dispatcher and helpers say "two" or "two to four"). For rule (c), they clarified that the real edge case is size "none" (CSS/docs only, ≤20 lines)—which skips review entirely, not because merge.mjs has an escape hatch, but because the review pipeline is moot for that scope. I found the `--no-review` flag but didn't fully explore the size-based exemption logic in practice.
