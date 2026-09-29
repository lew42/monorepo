# Several cheap AI agents research the same question in parallel, then must agree on one answer. Which way of reaching agreement gives the best answer for the least cost: a plain majority vote, a debate (agents argue over rounds), a Delphi process (anonymous rounds with feedback), or peer review (each reads one or two others, revises, then votes with a caveat)? Look for published results (papers such as 'Improving Factuality and Reasoning through Multiagent Debate', 'More Agents Is All You Need', work on LLM self-consistency and on debate vs voting), name what each finds, and recommend the method and the number of rounds our runner should use by default.

**Winner:** haiku-c — `public/framework/ai/2026-09-28/collab-rounds/research/collab/haiku-c/3-revise.md`
**Rule:** tie: cheaper member
**Run cost:** $1.9195

## Votes
- sonnet-b: 1 vote(s), $0.5749
- haiku-c: 1 vote(s), $0.4742

## Caveats
- haiku-a: Add mention of semantic self-consistency (grouping by answer similarity, not exact-match voting) as an optional mitigation for the backfire risk when all agents agree on a wrong answer on hard problems.
- sonnet-b: Add a concrete near-tie threshold (e.g. no answer above 50%, or winner under 60% of votes on 5 agents) so the runner's 'contested' trigger is unambiguous rather than left to judgment call.
