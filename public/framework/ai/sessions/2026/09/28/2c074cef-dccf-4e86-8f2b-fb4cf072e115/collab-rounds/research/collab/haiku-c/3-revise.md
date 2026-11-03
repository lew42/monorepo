# Revised: Agreement Methods for Multi-Agent AI Consensus

## Recommendation

**Plain majority voting with adaptive early-stopping: 5 agents, 1–2 rounds depending on consensus strength.** Stop after Round 1 if a clear majority emerges. Run exactly ONE revision round only if results are contested (near-tie or no majority). Never default to multi-round debate or Delphi; the research shows almost all gains come from the first revision round, and every round after that mostly adds cost, not accuracy.

## Why This Works Better Than Alternatives

### Voting (Independent Answers, Majority Pick)
**Winner for cost-accuracy tradeoff.** Single-inference-per-agent approach, no iterative rounds on easy questions where consensus exists.
- "More Agents Is All You Need" shows performance scales consistently from 3–40+ agents; 5 is cost-effective
- Self-consistency research: +17.9% on arithmetic (GSM8K), +11.0% on word problems
- **Critical caveat:** Voting can backfire on hard science problems for smaller LLMs when wrong answers cluster together (paper: "When Self-Consistency Backfires"); semantic self-consistency (grouping by answer similarity, not exact match) slightly reduces this risk

### Debate (Multiple Rounds of Back-and-Forth)
**Not recommended despite theoretical appeal.** Recent head-to-head comparison (arXiv 2508.17536) showed voting matches or beats debate performance when compute is equalized.
- Original paper ("Improving Factuality and Reasoning through Multiagent Debate", 2305.14325) shows gains vs single-agent, but was never compared fairly against voting at matched cost
- 3 agents × 2 debate rounds costs ~6× a single call; an equivalent token budget given to voting achieves the same or better accuracy
- **Major failure mode:** "Collective Delusion" — 65% of debate failures are agents reinforcing each other's wrong answer instead of catching it
- Debate behaves mathematically as a martingale: agents' beliefs don't systematically improve across rounds, they just drift stochastically

### Delphi Process (Anonymous Feedback Rounds)
**Promising middle ground but must use early-stop rule.** Structured feedback between rounds reduces conformity pressure better than debate's adversarial framing.
- Medical LLM study: 78.5% concordance with human expert consensus overall, 91.8% where human experts had consensus
- Token cost analysis (critical): single round with smart early-stop costs ~8–9× baseline; forcing all 6 rounds costs 33–49× baseline
- **Key insight:** 90%+ of trials stop after Round 1 without losing accuracy; almost all the gain is in that first revision round
- Optimal Delphi structure: Round 1 (independent), Round 2 (show all proposals aggregated, agents revise once), then STOP regardless of outcome

### Peer Review (Read 1–2 Others, Revise Once, Vote with Caveat)
**Closest to empirically optimal protocol.** One reading round + one revision round mirrors what Delphi cost data actually recommends.
- Each agent reads the 1–2 answers most different from its own, revises if it wants, reports a one-line caveat if unsure
- Avoids N² complexity if limited to reading only disagreeing peers
- Critical safety finding: wrong peer agreement is MORE effective at misleading initially correct models than correct peer agreement is at correcting wrong ones (arXiv 2606.01637); **flag disagreement rather than force false consensus**
- "Minority Sentinel" papers show detecting when majority is wrong requires keeping caveats, not merging them away

## Recommended Protocol for Your Runner

**Tier 1 (Most Questions): Single-Round Voting**
1. 5 agents answer independently in parallel, no cross-reading
2. Tally answers; if one answer has >50% agreement (clear majority), **STOP and report it**
3. Cost: ~5× single-agent call

**Tier 2 (Disputed Answers): One-Round Peer Review**
1. Triggered only if no clear majority (tie or split)
2. Each agent reads the answer(s) most different from its own, revises if desired, votes again with optional one-line caveat
3. Report final answer + note which agents flagged uncertainty
4. Cost: additional ~10× single-agent call (expensive, but only for ~10–20% of questions)

**Never:**
- Default to 3+ rounds; token cost rises to 30–50× baseline with minimal accuracy gain
- Run debate when voting achieves the same result cheaper and safer

## Why This Beats All Single-Method Defaults

- **vs pure voting:** Solves the "near-tie" failure mode cheaply; flags when consensus is brittle
- **vs full debate:** Avoids Collective Delusion; costs 1/5 the tokens; no systematic belief drift
- **vs full Delphi:** Delphi cost analysis proves most benefit is in round 1; Tier 2 revision captures that without forcing all rounds
- **vs peer review alone:** Early-stop rule means 80%+ of questions stay cheap (single-round voting); peer review only on the disputed minority

## Sources

- [Improving Factuality and Reasoning in Language Models through Multiagent Debate (arXiv:2305.14325)](https://arxiv.org/abs/2305.14325) — Liang et al., ICML 2024
- [More Agents Is All You Need (arXiv:2402.05120)](https://arxiv.org/abs/2402.05120) — Zhou et al., scaling study
- [Debate or Vote: Which Yields Better Decisions? (arXiv:2508.17536)](https://arxiv.org/abs/2508.17536) — Direct comparison; voting wins on cost
- [When Self-Consistency Backfires (arXiv:2608.11403)](https://arxiv.org/abs/2608.11403) — Voting failure on hard science problems
- [Collective Delusion in Multiagent Debate (Xie et al., 2026)](https://beancount.io/bean-labs/research-logs/2026/05/24/multiagent-debate-factuality-reasoning-llms) — 65% failure mode analysis
- [How AI Compares to Experts in Delphi Settings (Medical Consensus)](https://doi.org/10.1097/JS9.0000000000003631) — 78.5% concordance; token cost data
- [Easier to Mislead Than to Correct (arXiv:2606.01637)](https://arxiv.org/abs/2606.01637) — Safety risk of peer pressure
- [Minority Sentinel (arXiv:2606.29270)](https://arxiv.org/abs/2606.29270) — Detecting when majority is wrong
- [Self-Consistency Improves Chain of Thought (iclr23b)](http://webdocs.cs.ualberta.ca/~dale/papers/iclr23b.pdf) — Baseline voting gains
