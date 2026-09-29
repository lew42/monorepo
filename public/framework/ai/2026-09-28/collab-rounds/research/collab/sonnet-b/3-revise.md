# Cheapest way for parallel agents to agree on one answer (revised)

## Answer

**Plain majority vote (self-consistency) over independent answers, 1 round, 5 agents by default.**
Escape hatch: only when the vote is a near-tie, run one extra round where agents see the answers
that differ most from their own, may revise, and revote with a one-line caveat if still unsure.
Stop after 2 rounds regardless. Don't use full multi-round debate or Delphi as the default.

This didn't change from my first pass — but a direct comparison paper both peers found, and a
failure mode neither of us had fully weighted, sharpen it.

## What the papers find

**Voting (self-consistency).** "More Agents Is All You Need" (arxiv 2402.05120): N independent
samples + majority vote gives a real scaling law — accuracy climbs as N grows on GSM8K, MATH,
MMLU, HumanEval; a swarm of small models can match a single big one. This is the cheapest method:
N parallel calls, no cross-talk.

**Debate.** The original paper (arxiv 2305.14325) showed debate beats single-model zero-shot CoT
and self-reflection. But a direct head-to-head, "Debate or Vote: Which Yields Better Decisions in
Multi-Agent LLMs?" (arxiv 2508.17536), found majority voting alone accounts for *most* of the
performance gain usually credited to debate, across seven benchmarks — debate behaves like a
stochastic process, not a systematic improvement toward truth, and needs 2-5x the tokens for
marginal or negative returns past 2-3 rounds. A separate failure analysis found 65% of debate
failures were agents reinforcing each other's wrong answer rather than correcting it ("collective
delusion"). Put together: debate's extra cost mostly buys agents agreeing with each other, not
agreeing on the right answer.

**Delphi (anonymous rounds, see the aggregate, revise, no identities).** A medical-consensus
study got 85.7% agreement after just 1 revision round, with 78.5-91.8% concordance with human
experts. A separate cost study found token spend rises from ~8-9x a single call (with an early-stop
rule) to 33-49x if all 6 rounds run — but 81-95% of trials could have stopped after round 1 or 2
without losing much. Lesson: in every rounds-based method studied, nearly all the benefit is in
the *first* revision round; every round after that is mostly cost, not accuracy.

**Peer review (read 1-2 others, revise, vote with a caveat).** Structurally this is Delphi's
efficient shape (one look at others, one revision) but with named authors instead of anonymity.
The risk it needs to guard against, flagged clearly by both peers' sources: wrong peer agreement
is *more* effective at dragging a correct agent to a wrong answer than correct peer agreement is
at fixing a wrong one ("Easier to Mislead Than to Correct," arxiv 2606.01637). That is the reason
the caveat/confidence flag matters — it's what lets a downstream reader or a second pass catch a
case where peers talked each other into the wrong answer, instead of that error being silently
absorbed into a confident-looking vote.

**One more caution neither of us had at first:** self-consistency itself isn't perfectly safe —
"When Self-Consistency Backfires" (arxiv 2608.11403) found that on hard science problems, more
samples can entrench a wrong answer once every agent happens to agree on it. Voting is cheap and
usually right, but a unanimous wrong vote looks exactly like a unanimous right one. This is the
argument for keeping the tie-break/caveat escape hatch even though most questions won't need it —
it's not there to catch disagreement, it's the only cheap signal we get that something might be
wrong even when everyone agrees.

## Recommendation for our runner

1. **Round 1, always:** 5 agents answer independently in parallel, no cross-reading. Vote.
2. **Clean majority (agreement clearly above half):** stop, report the majority answer. This is
   most questions, and it's the cheapest path — 1x the compute of a single agent's answer, times 5,
   with no extra rounds.
3. **Near-tie, no clear majority, or every agent agrees but low individual confidence:** run ONE
   more round. Each agent reads the 1-2 answers most different from its own (peer-review shape,
   not full anonymous Delphi — named, targeted, cheap), may revise, and revotes with a one-line
   caveat if still unsure.
4. **Stop after round 2, no matter what.** Report the vote plus the caveat if one exists, rather
   than spending a third round chasing full consensus. The Delphi and debate cost data both say
   round 3+ buys little accuracy for several times the tokens, and for debate specifically it risks
   the group converging on a shared wrong answer instead of the right one.

Net effect: self-consistency's low cost on the easy majority of questions, one peer-review-style
revision only on the disputed or unconfident minority, and a caveat flag as the cheap check against
both silent majority-vote failure and silent peer-review conformity — capped at 2 rounds so the
cost never creeps toward debate or full Delphi territory.

## Sources

- [Improving Factuality and Reasoning in Language Models through Multiagent Debate](https://arxiv.org/abs/2305.14325)
- [More Agents Is All You Need](https://arxiv.org/pdf/2402.05120)
- [Debate or Vote: Which Yields Better Decisions in Multi-Agent LLMs?](https://arxiv.org/abs/2508.17536)
- [Multiagent LLM Debate: Real Accuracy Gains, Uncontrolled Compute, and Collective Delusion](https://beancount.io/bean-labs/research-logs/2026/05/24/multiagent-debate-factuality-reasoning-llms)
- [When Self-Consistency Backfires: Majority Vote Hurts the Majority of Hard Science Problems for Small LLMs](https://arxiv.org/abs/2608.11403)
- [Easier to Mislead Than to Correct: Harmful Revision in LLM Conformity](https://arxiv.org/pdf/2606.01637)
- [How does AI compare to the experts in a Delphi setting: simulating medical consensus with LLMs](https://doi.org/10.1097/JS9.0000000000003631)
- [Multi-Round compared to Real-Time Delphi for consensus in core outcome set development](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7885346/)
