# When a Claude agent is picking a name for a new CSS class in this framework, what are the simple, foundational rules it should never break — and where are those rules genuinely just guidelines instead of hard rules?

**Winner:** sonnet-b — `public/framework/ai/2026-09-28/collab-facts/real-run/collab/sonnet-b/4-revise.md`
**Rule:** most votes
**Run cost:** $1.2761

## Votes
- sonnet-b: 2 vote(s), $0.5752
- haiku-a: 1 vote(s), $0.3948

## Caveats
- haiku-a: Both answers are solid, but sonnet-b's deeper exploration of the 'optional' re-prefixing risk (warning that nesting doesn't provide collision safety, only selector organization) and its proposal to document 'more specific prefix wins' as a stated default convention are more useful than the alternatives. One small improvement: rank the five hard rules by criticality — the live census check is the one mechanism that catches hidden class names and should come first.
- haiku-c: The guideline section is clearer on why 'optional' is misleading and proposes a longest-prefix convention for precedence; the one improvement would be shortening the repetition about 'optional' — the heading and the caveat say similar things, and both say it again in the bottom line.
- sonnet-b: It restates the census grep command inline, which risks going stale if the skill's command ever changes — better to point at the skill step number than re-embed the exact command.
