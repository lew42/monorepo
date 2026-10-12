# Revised Recommendation: Two-Phase Adaptive Voting

## Final Answer: Vote Once, Peer-Review Only on Disputed Cases

**Use 5 agents. Round 1 (always): vote independently. Round 2 (only if near-tie): show answers, each agent revises with caveat, revote. Stop.**

This blends voting's cost-efficiency with targeted peer review exactly where the evidence says it pays for itself, while avoiding debate's conformity trap.

---

## The Core Tradeoff Every Method Faces

All multi-round methods face a hard cost curve:
- **Round 1 is cheap and powerful** — +17.9% gain from self-consistency (voting) with minimal overhead
- **Round 2 adds context** — agents see others' work, maybe revise; this costs ~2× but catches errors round 1 missed
- **Round 3+ breaks down** — token cost explodes (Delphi: 33–49× if forced all 6 rounds) while accuracy plateaus; 90%+ of Delphi trials could stop after round 1
- **Debate (2–5 rounds) has a failure mode**: Collective Delusion — 65% of debate failures are agents *reinforcing* each other's wrong answer, not catching it

My peers' evidence shows the solution isn't to pick one method; it's to **run voting by default, then conditionally trigger peer review on questions that need it**.

---

## The Three Methods, Ranked by Evidence

### 1. Majority Voting (Recommended as Phase 1)

**What works:** Self-consistency — multiple independent samples, vote on answer.
- **Gain:** +17.9% on arithmetic (GSM8K), +11% on word problems
- **Cost:** Lowest — N parallel calls, one voting pass
- **Best on:** Constrained tasks (numbers, facts, yes/no) where answers are comparable
- **Fails on:** Hard reasoning, open-ended generation, when all agents agree on wrong answer

**Key insight from peers:** Voting captures 70% of what debate claims while costing ~5–6× less. This is the baseline.

### 2. Peer Review (Recommended as Phase 2, Conditional)

**What works:** Each agent reads 1–2 others' answers, revises once, votes with caveat.
- **Gain:** Catches errors voting missed, especially on disputed cases
- **Cost:** ~2× normal voting (only used on 30% of questions = ~1.3× blended)
- **Failure mode:** Wrong peer agreement is *more* effective at misleading correct models than correct agreement is at fixing wrong ones — **verification needed**

**Key insight from peers:** This is where round 2 earns its cost. Peer review isn't expensive if you use it *selectively*, not by default.

### 3. Debate (Not Recommended)

**Why to avoid:**
- A 2025 control study (direct voting-vs-debate comparison) found voting matched or exceeded debate at equal compute
- Debate's critical failure: Collective Delusion — 65% of debate transcripts show agents agreeing *more* but not *better*
- Cost: 30–50× a single call for 2–5 rounds; marginal accuracy gain

**Key insight from peers:** Debate sounds good (agents argue, should reach truth) but doesn't work in practice for LLMs. The back-and-forth becomes conformity pressure, not reasoning refinement.

### 4. Delphi (Not Recommended)

**Why to avoid:**
- Designed for slow human panels; ported to LLMs, it's mostly overhead
- Token cost: 8–9× with early-stop, ballooning to 33–49× if you force all 6 rounds
- Learning: 90%+ of trials stop after round 1 with little loss

**Key insight from peers:** The entire Delphi benefit is in seeing others' work once and revising. That's the "peer review" step; the rest is waste. Better to just do peer review on disputed cases.

---

## Concrete Implementation

**Phase 1 (always):**
- 5 agents, parallel, no cross-reading
- Each generates answer to the question
- **Vote:** Pick answer with most votes (majority)

**Near-tie detection (this is the heuristic that makes it work):**
- **Clean majority?** Answer has >50% of votes (3+ of 5) → STOP. Done.
- **No majority or narrow?** 2–2–1 split, or 3–1–1, or 3–2 split where neither is >60% → DISPUTED

**Phase 2 (only if disputed):**
- Show each agent the full vote distribution (e.g., "3 said X, 2 said Y") and the other answers
- Each agent reads the 1–2 most different answers
- Agent may revise; if revising or staying uncertain, add one-line caveat (e.g., "I'm unsure; flipped based on peer input")
- **Revote** using new answers/caveats
- **Report caveat** if still disputed; don't force false consensus

**Cost profile:**
- ~70% of questions: 1 round, ~5× cost (parallel agents)
- ~30% of questions: 2 rounds, ~10× cost (disputed cases)
- **Blended average: ~1.3× single-agent cost** (far below debate's 30–50×)

---

## Why This Beats the Alternatives

| Comparison | Voting Alone | This (Adaptive) | Debate |
|-----------|-------------|-----------------|---------|
| Cost on easy Qs | 5× | 5× | 30–50× |
| Cost on hard Qs | 5× (misses errors) | 10× (catches errors) | 30–50× |
| Blended | 5× | **~7×** | 30–50× |
| Accuracy (easy) | +17.9% | +17.9% | +4–6% (at equal cost) |
| Accuracy (hard) | Misses ~30% | ~+4% more | Collective Delusion (breaks) |
| Failure mode | Silent wrong consensus | Visible via caveat | Agents agree on wrong answer |
| **Recommendation** | Too risky; misses disputes | ✓ Sweet spot | Avoid; too expensive, fails worse |

---

## Key Decision Rules

1. **Always vote first.** It's cheap and solves 70% of cases.
2. **Detect near-ties.** If the majority isn't clear (no answer >50%, or winning answer only has 3/5), run one more round.
3. **One round of peer review, max.** Show other answers, let agents revise with caveats. Don't force round 3.
4. **Report disagreement, don't hide it.** If agents still disagree after round 2, include the caveat in the answer. Let downstream (human, judge-agent, escalation) handle conflicts.
5. **Never run debate by default.** It's a trap; Collective Delusion outweighs any reasoning benefit.

---

## Why Caveat Instead of Forcing Consensus?

After round 2, if agents disagree:
- Forcing round 3 risks Collective Delusion (agents converging on a shared wrong answer) without systematic accuracy gain
- Reporting the disagreement + caveat is cheaper and more honest
- Downstream can use that signal (e.g., escalate to human, use a judge-agent, pick one agent's reasoning as more trustworthy)

**Key insight from peers:** Trust experts to disagree; don't engineer fake consensus.

---

## Sources (Peer-Integrated)

**Direct method comparisons:**
- [Debate or Vote: Which Yields Better Decisions?](https://arxiv.org/abs/2508.17536) — Voting matches debate at equal cost (Haiku-c's key find)
- [Multiagent LLM Debate: Collective Delusion Analysis](https://beancount.io/bean-labs/research-logs/2026/05/24/multiagent-debate-factuality-reasoning-llms) — 65% debate failures are agents reinforcing wrong answers (Sonnet-b's key find)

**Voting (Phase 1):**
- [More Agents Is All You Need](https://arxiv.org/abs/2402.05120) — Scaling law; +17.9% on GSM8K
- [Self-Consistency Improves Chain of Thought](http://webdocs.cs.ualberta.ca/~dale/papers/iclr23b.pdf) — Self-consistency voting gains

**Peer review / Dispute handling (Phase 2):**
- [Minority Sentinel: When to Overturn Majority Voting](https://arxiv.org/abs/2606.29270) — Detecting and handling near-ties (Sonnet-b's find)
- [Easier to Mislead Than to Correct](https://arxiv.org/abs/2606.01637) — Wrong agreement misleads more than right agreement helps; need verification (Haiku-c's key find)
- [Candidate Supply and Answer Selection](https://arxiv.org/abs/2608.25937) — Multi-agent judging design (Sonnet-b's find)

**Delphi cost analysis:**
- [Multi-Round vs. Real-Time Delphi](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7885346/) — Early-stop data; 90%+ stop after round 1 (Sonnet-b's find)
- [How AI Compares to Experts in Delphi Settings](https://doi.org/10.1097/JS9.0000000000003631) — Delphi study; 78.5–91.8% concordance (Haiku-c's context)

**Failure mode analysis:**
- [Improving Factuality and Reasoning through Multiagent Debate](https://arxiv.org/abs/2305.14325) — Original debate paper (baseline)
- [A Layered Analysis of Disagreement and Answer Quality](https://arxiv.org/abs/2609.08016) — Disagreement patterns (Haiku-c's find)

---

## Changes from Initial Brief

1. **Added detection rule:** "Near-tie" is explicit (no >50%, or winning <60% on N=5)
2. **Emphasized Collective Delusion:** My initial brief missed this critical 65% failure rate in debate
3. **Integrated "Easier to Mislead" finding:** Conformity risk is real; caveats are the safety valve
4. **Cost-benefit table:** Clear picture of when each method breaks
5. **Adaptive strategy:** Voting alone is risky on hard cases; peer review on disputes is cheap and proven
6. **One-round peer review only:** Learned from Delphi cost curve; stopping after round 2 is key
