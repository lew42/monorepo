# Reading the peers

**haiku-x**: Found the concrete escape hatch I missed entirely — `Server/merge.mjs` takes a
`--no-review "why"` flag that explicitly bypasses the review gate with a loud warning, rather than
the gate being unconditional for `light`/`full` branches as I assumed; also correctly separates
the "two or three sentences" wording as belonging to the `every-prompt`/dashboard-card tier, not
the sub-mastermind docs specifically.

**haiku-y**: Sourced a different, more specific set of docs (`every-prompt/cards.md` and the
`assistant-layers` requirements) showing "one or two sentences" as the pattern for card-assistant
and master-assistant roles, and adds a real edge case I hadn't found — substantive explanations
are meant to go on a separate board "Note:" card instead of stretching the `card_reply` itself.
Also sharpens (c) usefully: `merge.mjs` internally calls plain `git merge --no-ff` itself, so the
rule is really "agents never run git commands on main," not "git merge is forbidden" — a cleaner
framing than mine.
