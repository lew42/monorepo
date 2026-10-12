# Cheapest way for parallel agents to agree on one answer

## Short answer

**Plain majority vote over independent samples (self-consistency), 1 round, 5 agents.** Add one
cheap escape hatch: if the vote is a near-tie (no answer has a clear majority), run ONE extra
round where each agent reads the other answers and revotes. That is closer to peer review than
full debate, and it is the cheapest fix for the failure mode votes actually have.

Do not default to multi-round debate or Delphi. Both cost several times more and the published
evidence says the extra cost mostly buys agents talking each other into the same wrong answer,
not a more correct one.

## What each method actually is, and what was found

**Majority vote / self-consistency (no talking, just N independent tries + a vote).**
"More Agents Is All You Need" (arxiv 2402.05120) samples the same question N times and votes.
Accuracy climbs as N grows, on GSM8K, MATH, MMLU, HumanEval — a "scaling law" from adding cheap
independent tries. This is the cheapest option: N parallel calls, no back-and-forth, no extra
tokens for reading each other. It's also the baseline every other method has to beat.

**Debate (agents see each other's answers and argue over several rounds).**
The original paper, "Improving Factuality and Reasoning through Multiagent Debate" (arxiv
2305.14325), showed debate beats a single model doing zero-shot chain-of-thought or self-reflection
— but it was never compared properly against plain voting at matched cost. A 2025 follow-up
control study did that comparison: 3 agents debating 2 rounds costs roughly 6x a single call, and
once you equalize the compute (give a single agent or a self-consistency vote the same token
budget), "single-agent systems can match or outperform" the multi-agent debate. Worse, a failure
analysis of 100 debate transcripts found 65% of failures were "Collective Delusion" — agents
reinforcing each other's wrong answer instead of catching it, which is the opposite of what
debate is supposed to buy you.

**Delphi (anonymous rounds, agents revise after seeing an aggregated summary, no identities).**
Delphi is built for slow, careful human panels reaching consensus over weeks. Ported to LLMs, one
study on rescuing borderline consensus statements got to 85.7% agreement after just 1 revision
round, and most of the benefit came from that first round. Another applied study found token cost
rose from ~8-9x a single call (with a smart early-stop rule) to 33-49x once you force all 6 rounds
— and 90%+ of trials could have stopped after round 1 without losing much. The lesson from Delphi
research generalizes to all rounds-based methods: **almost all of the gain is in the first
revision round; every round after that mostly adds cost, not accuracy.**

**Peer review (each agent reads 1-2 others, revises once, votes with a stated caveat).**
This is closest to what the Delphi early-stop data actually recommends: one round of seeing
others' work, one revision, then vote — but keep the caveat/confidence flag, because it's what
lets you catch the near-tie cases cheaply instead of paying for more rounds on every question.
Papers on multi-agent judging (e.g. "Candidate supply and answer selection shape the value of LLM
judging") and on catching bad majorities ("Minority Sentinel: When to Overturn Majority Voting")
back this shape: don't trust a peer-reviewed vote blindly either — flag disagreement rather than
force false consensus.

## Recommendation for our runner

1. **Round 1, always:** N agents (5 is a good default — matches "More Agents" scaling curve
   without runaway cost) answer independently, in parallel, no cross-reading. Vote.
2. **If the vote is a clean majority** (more than half agree, or the tie-break margin is wide),
   stop. This is most questions — cheap, one round, done.
3. **If it's a near-tie or no majority:** run exactly ONE more round — each agent reads the 1-2
   other answers that differ most from its own, revises if it wants, and revotes with a one-line
   caveat if it's still unsure. Stop after this round regardless of outcome; report the caveat
   rather than debating further.
4. **Never go past 2 rounds by default.** The evidence (Delphi cost data, the debate compute-control
   study) says round 3+ is spending several times the tokens to buy very little accuracy, and for
   debate specifically it risks agents converging on a shared wrong answer instead of a right one.

This gives you self-consistency's cheapness on the easy majority of questions, and a single
peer-review-style revision only on the disputed minority — which is where the research shows
extra rounds actually pay for themselves.

## Sources

- [Improving Factuality and Reasoning in Language Models through Multiagent Debate](https://arxiv.org/abs/2305.14325)
- [More Agents Is All You Need](https://arxiv.org/pdf/2402.05120)
- [Multiagent LLM Debate: Real Accuracy Gains, Uncontrolled Compute, and Collective Delusion](https://beancount.io/bean-labs/research-logs/2026/05/24/multiagent-debate-factuality-reasoning-llms)
- [Minority Sentinel: When to Overturn Majority Voting in Multi-Agent LLM Debates](https://arxiv.org/pdf/2606.29270)
- [Candidate supply and answer selection shape the value of LLM judging in multi-agent systems](https://arxiv.org/pdf/2608.25937)
- [How does AI compare to the experts in a Delphi setting: simulating medical consensus with LLMs](https://doi.org/10.1097/JS9.0000000000003631)
- [Multi-Round compared to Real-Time Delphi for consensus in core outcome set development](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7885346/)
