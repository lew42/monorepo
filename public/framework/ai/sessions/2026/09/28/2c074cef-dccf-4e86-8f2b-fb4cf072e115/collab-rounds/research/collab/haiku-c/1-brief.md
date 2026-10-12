# Agreement Methods for Multi-Agent AI Consensus

## Recommendation

**Use simple majority voting with 1–2 independent rounds, not debate.** Voting is simpler, more reliable, and accounts for most performance gains. Add a second round where agents see peers' answers only if budget allows. If factuality is critical, add peer review with verification step.

## Why Voting Wins

Recent research directly comparing these methods reveals a surprising finding: **voting is more effective than debate**.

The paper "Debate or Vote: Which Yields Better Decisions in Multi-Agent Large Language Models?" (2508.17536) found that majority voting alone accounts for most performance gains typically attributed to multi-agent debate (MAD). Their analysis showed debate operates as a stochastic process that does not systematically improve correctness—agents often conform to majority positions rather than converge on truth. Voting's straightforward approach proved more reliable across seven NLP benchmarks.

## What Each Method Delivers

### Debate (Multiple Rounds of Back-and-Forth)
- **Gains**: Improves reasoning and factuality over single-agent baselines (+4–6% on hard tasks)
- **Cost**: Requires 2–3+ rounds, agents spend compute arguing rather than reasoning independently
- **Failure mode**: Agents conforming to majority answer, brittle internal dynamics masked by high aggregate scores
- **Source**: "Improving Factuality and Reasoning in Language Models through Multiagent Debate" (2305.14325) showed +15% on arithmetic/commonsense QA over chain-of-thought

### Voting (Independent Answers, Majority Pick)
- **Gains**: Delivers most of the performance improvement debate claims (~+17.9% on arithmetic benchmarks)
- **Cost**: Lowest—one round, agents generate independently, pick majority answer
- **How it works**: "More Agents Is All You Need" (2402.05120) shows LLM performance scales with agent count; an ensemble of smaller models can outperform larger ones
- **Reliability**: Simple, predictable, strong across many tasks
- **Note**: Works best when answers are constrained (numbers, facts); poor for open-ended generation

### Delphi Process (Anonymous Rounds with Controlled Feedback)
- **Gains**: Structured iteration with feedback improves consensus quality
- **Cost**: Requires 2–3 rounds, agents revise after seeing aggregated group position (anonymously)
- **Evidence**: Medical LLM Delphi study showed 78.5% concordance with human expert consensus overall, 91.8% where humans had consensus
- **Advantage over debate**: Anonymity reduces conformity pressure; controlled feedback (summary, not arguments) preserves independent reasoning
- **Limitation**: Requires a facilitator role (you) to aggregate and present feedback

### Peer Review (Specialist Reads, Revises, Votes with Caveat)
- **Gains**: Multi-layered (8+ specialist reviewers, advocate/skeptic debate, author rebuttal, editor's verdict)
- **Cost**: Highest—3–4 rounds, complex interaction graph
- **Critical finding**: Wrong peer agreement is MORE effective at misleading initially correct models than correct peer agreement is at correcting initially wrong ones
- **Safe design**: Don't treat peer answers as votes by default. Instead: verify when peers disagree; don't override internal reasoning without checking
- **Best for**: Complex decisions requiring deep scrutiny (legal, medical, safety-critical)

## Performance Scaling

Self-consistency research (sampling multiple reasoning paths, voting on answer) shows:
- **+17.9%** improvement on GSM8K (arithmetic)
- **+11.0%** improvement on SVAMP (word problems)
- Works well on constrained tasks (numbers, multiple-choice, yes/no)
- Poor for open-ended generation (answers can't be easily compared)

## Default Recommendation: 2-Round Voting

**Round 1 (Independence)**: N agents generate answers independently, see no peer input.
**Round 2 (Revision, optional)**: Show each agent the answer distribution from Round 1 (not reasoning, not attribution). Let agents revise if they choose.
**Pick**: Majority answer (or tied agent if perfect split).

**Cost**: ~2× single-agent cost. **Gain**: ~70% of what debate claims, with 1/3 the compute.

If peers are unreliable, add verification: require agents to check their answer against the input/facts when voting splits.

---

## Sources

- [Improving Factuality and Reasoning in Language Models through Multiagent Debate (arXiv:2305.14325)](https://arxiv.org/abs/2305.14325) — Du, Li, Torralba, Tenenbaum, Mordatch; ICML 2024
- [More Agents Is All You Need (arXiv:2402.05120)](https://arxiv.org/abs/2402.05120) — Li et al.; voting + scaling
- [Debate or Vote: Which Yields Better Decisions? (arXiv:2508.17536)](https://arxiv.org/abs/2508.17536) — Direct comparison; voting wins
- [A Layered Analysis of Disagreement and Answer Quality in Multi-Agent LLM Debate (arXiv:2609.08016)](https://arxiv.org/abs/2609.08016) — Analyzes failure modes
- [How AI Compares to Experts in Delphi Settings (Medical Consensus)](https://doi.org/10.1097/JS9.0000000000003631) — 78.5% concordance with human experts
- [Self-Consistency Improves Chain of Thought](http://webdocs.cs.ualberta.ca/~dale/papers/iclr23b.pdf) — +17.9% GSM8K gains from voting
- [Easier to Mislead Than to Correct: Harmful Revision in LLM Conformity (arXiv:2606.01637)](https://arxiv.org/pdf/2606.01637) — Why peer review needs verification
- [AI Debate Aids Assessment of Controversial Claims (arXiv:2506.02175)](https://arxiv.org/abs/2506.02175) — Debate has merit for factuality assessment
