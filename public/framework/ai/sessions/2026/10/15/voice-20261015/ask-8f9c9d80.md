# Ask 8f9c9d80 — standing rules (voice, 2026-10-15)

Verbatim, as relayed by the voice agent:

> Owner's direction, capture verbatim as a standing rule:
>
> 1. Domain masterminds don't need to be permanent. The README chain IS the full configuration of a domain mastermind. Keep it always current; when a page or AI-systems mastermind is needed, just spawn an agent told to read that documentation. So no Servex "domain mastermind" role is required.
>
> 2. Green light the per-module past-work script (node, no AI reading: join task.jsonl landed lines, git commits touching the path, ai/ folder touches; print day/week/month list graded landed-and-committed / committed-never-closed / never-started). Then the per-folder landing log line as step two.
>
> 3. README verification method for the two scoped agents (page and AI systems): the mastermind does not read the code. It spawns a Sonnet minion that reads the actual code, then asks it ONE question at a time drawn from the README: "is this statement correct?" Verify the README claim by claim, flag anything stale. Rationale, record this as a general principle: AIs try to do too much at once; one specific question per step is better. Write that principle into the skill or CLAUDE.md guidance.

## Decisions

- Rule 1 and the one-question principle go into the `mastermind` and `minion` skills now. CLAUDE.md is edit-on-ask, so a one-line addition is proposed, not applied. The alternative was editing CLAUDE.md directly.
- The memory note `domain-masterminds.md` is marked as superseded by rule 1.
- The script is built by a Sonnet helper in `past-work-log/`. The per-folder landing line is step two.
- The claim-by-claim readme verification runs after the two current helpers finish their first pass.
