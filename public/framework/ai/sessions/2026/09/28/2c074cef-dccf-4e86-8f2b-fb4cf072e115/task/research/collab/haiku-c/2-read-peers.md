# Read Peers

## Haiku-a

Found that voting can **backfire on hard science problems for small LLMs** when all samples agree on a wrong answer (citing "When Self-Consistency Backfires"); also detailed semantic self-consistency (grouping by similarity rather than exact match) as slightly better than hard voting, and that peer review has N² complexity — all concrete limitations I missed. We align that voting beats debate on cost and that Delphi is a promising optional upgrade.

## Sonnet-b

Identified the specific failure mode of debate I only hinted at: **"Collective Delusion"** where 65% of debate failures are agents reinforcing each other's wrong answers; also provided token cost breakdowns for Delphi (8–9x for single round with smart early-stop, up to 33–49x forced rounds), proving "almost all gain is in the first revision round" — and recommended an adaptive two-tier protocol (cheap single-round vote for clean majorities, one peer-review revision only for near-ties). The cost analysis and early-stop insight are more actionable than my general recommendation.

