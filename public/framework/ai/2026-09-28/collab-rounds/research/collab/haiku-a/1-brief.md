# Collaboration Methods for Cheap AI Agents: Research Summary

**Haiku-a** | Research into multi-agent agreement methods

## Answer: Majority Voting with 3-5 Agents

For the best answer at the lowest cost, **majority voting with 3 to 5 agents and no debate rounds** is the clear winner. Here's why each method ranks:

### Method Rankings (Cost-Benefit)

**1. Majority Voting** — RECOMMENDED (Best cost-accuracy tradeoff)
- Single inference per agent; no iterative rounds
- Significantly cheaper than debate: one parallel pass instead of multiple sequential passes
- Performs *on par* with more complex debate approaches
- Self-consistency research shows voting is robust for easier problems
- Caveat: Can backfire on very hard problems for smaller models; check if your tasks are genuinely difficult before scaling

**2. Debate** — Not recommended for your use case
- Multiple agents generate rounds of arguments (typically 2-5 rounds tested)
- Requires 2-5x more tokens per problem than voting
- Recent research (2508.17536) proves voting alone accounts for *most* performance gains
- Debate marginally outperforms voting on some benchmarks but the cost far exceeds the benefit
- Theoretical analysis shows debate behaves as a martingale—agents' beliefs don't systematically improve across rounds

**3. Delphi Process** — Promising but unproven at scale
- Structured feedback loops: independent round → all proposals shown → refined round → final vote
- Shows success in medical consensus and fact verification
- ~3 rounds is typical; reaches consensus at 70%+ agreement
- Advantage: incorporates reasoning justification, not just answers
- Limitation: Limited comparative cost data; likely more expensive than voting but cheaper than full debate

**4. Peer Review** — Emerging but expensive
- Agents evaluate each other's reasoning quality (similar to academic review)
- Outperforms single-agent on medical reasoning tasks
- Requires each agent to read and critique others; implies N² complexity for N agents
- Least studied of the four methods; too new for a confident recommendation

## Key Research Findings

**On Voting vs. Debate (Xie et al., 2508.17536):**
- Majority voting matched or exceeded debate performance across most benchmarks
- Tested 5 agents × 2-5 rounds
- Debate requires "substantially more computational resources" with "diminishing or negative returns" beyond 2-3 rounds
- Conclusion: "Simple ensembling methods remain strong and more reliable alternatives"

**On Agent Scaling (Zhou et al., 2402.05120):**
- Performance improves consistently as agents scale from 1 to 40+
- Smaller models (Llama2-13B) matched larger ones (Llama2-70B) via agent scaling
- No single optimal count identified; task-dependent
- Trade-off: "one can trade a higher token budget for improved performance"
- Cost limitation acknowledged: "each input remains the same when we increase the number of agents"

**On Self-Consistency and Voting (Wei et al. et al.):**
- Majority voting works well for moderate-difficulty problems
- Can backfire on hard science problems for smaller LLMs; when all samples agree on a wrong answer, more samples entrench the error
- Semantic self-consistency (grouping by similarity, not exact match) slightly better than hard voting

**On Delphi-Style Processes (Li et al., DelphiAgent):**
- Multiple LLMs as virtual panelists; 3 deliberation rounds typical
- Round 1: Independent judgment by each agent
- Round 2: All proposals shown; agents can revise positions
- Round 3: Final vote
- Consensus reached at ≥70% agreement; reduces hallucinations in fact verification

**On Debate (Liang et al., ICML 2024):**
- Multiple agents generate and critique competing responses over rounds
- Significant gains in math and reasoning tasks
- Also reduces factual hallucinations
- Trade-off: Requires multiple sequential passes; each agent generates multiple times

## Recommendation for Your Setup

**Default configuration: 3 agents, 1 vote round (parallel), no debate.**

- **Why 3 agents?** Cost-effective threshold; 3 independent samples catch most stochastic errors; diminishing returns beyond 5
- **Why voting?** Cheaper than debate by 2-5×; matches or beats debate performance on most tasks
- **Optional upgrade:** If your tasks are hard reasoning problems and budget allows, consider **Delphi with 3 rounds** instead (agents see each other's reasoning, refine once, vote). This costs more than voting but less than debate, and incorporates reasoning visibility.

**Avoid debate** unless you have evidence that your specific task class genuinely requires multi-round argument refinement. The research suggests it's a false choice—voting beats it on cost.

**Monitor:** If results on your problem class are consistently poor across all agents, consider peer review (agents read and rate each other's work before voting), but this adds complexity; simpler first to get baseline.

## Sources

- [Improving Factuality and Reasoning in Language Models through Multiagent Debate](https://arxiv.org/abs/2305.14325) — Liang et al., ICML 2024
- [More Agents Is All You Need](https://arxiv.org/abs/2402.05120) — Zhou et al., scaling study
- [Debate or Vote: Which Yields Better Decisions in Multi-Agent LLMs?](https://arxiv.org/abs/2508.17536) — Direct voting vs. debate comparison
- [When Self-Consistency Backfires: Majority Vote Hurts the Majority of Hard Science Problems for Small LLMs](https://arxiv.org/abs/2608.11403) — Limitation of voting on hard tasks
- [When LLMs Agree, Are They Right? Auditing Self-Consistency](https://arxiv.org/abs/2607.08065) — Confidence calibration of agreement
- [DelphiAgent: A trustworthy multi-agent verification framework](https://www.sciencedirect.com/science/article/abs/pii/S0306457325001827) — Delphi consensus approach
- [Let LLMs Judge Each Other: Multi-Agent Peer-Reviewed Reasoning for Medical Question Answering](https://arxiv.org/abs/2606.15419) — Peer review method
- [Scoring, Reasoning, and Selecting the Best! Ensembling Large Language Models via a Peer-Review Process](https://arxiv.org/abs/2512.23213) — LLM peer review for selection
- [An LLM-based Multi-Agent Collaborative Approach](https://www.medrxiv.org/content/10.1101/2025.08.11.25333429v2.full.pdf) — Multi-agent collaboration study
- [Consensus Method research in medical LLM applications](https://link.springer.com/article/10.1007/s44443-025-00353-3) — Consensus-building with LLMs
