# Decisions: documenting the logic behind the work: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). Re-read them before each step.

**Owner:** mastermind-servex (the system architect). **Queued** behind the probe-task work, for weekly pace. Start it when the week's usage is back under its elapsed share.

## The problem
Agents reason a lot ("if we do this, then that works…"), and almost none of it is documented in a form the owner can see. We pay for that work, so we want to see into it and check that the reasoning is sound.

## The system: one documented path per task
1. **Clean transcription,** then a **refined prompt,** then a **statement outline,** then a **brief.** (These already exist in parts: Refine, the briefs.)
2. **Investigation (for a new topic).** Name the FACTS: high-confidence, verifiable things with a source (for example, "the docs are at this URL", or "live video needs a server and client streaming code"). For a known topic, the readme chain gives the facts.
3. **Shape first:** a quick high-level picture of what will be made, its parts and how they talk to each other. For code, that's the classes, files, imports and API, before anything is built.
4. **Decisions,** each one a named card:
   - what is being decided, and what it influences;
   - the options as a RANKED list, with pros, cons and caveats;
   - a **decision table** (factors × questions, with the answers in the cells).
5. **Weights.** Each option gets a `weight` (default 1, a multiplier). It can be a composite of sub-weights (importance, confidence, probability, relevance), each starting at 1 and multiplied together. Models can agree on sub-weights even where they differ on the total. Several models weigh in; record the mean and the spread (high variance means review it).
6. **Decide without blocking** (CLAUDE.md law 5). Take the best option, RECORD the alternatives, and keep going.
7. **Revisit.** When later work struggles, look back at the recorded decisions. An alternative that would solve the trouble is a reason to switch.

## Guard against analysis paralysis
Cap the depth. Explore caveats one level deep, not every permutation. Past that cap, trust the ranked gut call plus the weighted feedback. A decision with no clear winner (equal weights, high spread) is decided by the simplest option, not by researching more.

## Build on what exists, don't duplicate (CLAUDE.md law 6)
- the `decide` skill and `Server/decide.mjs` (which writes decisions step by step);
- `ux/Content/Decision` (the Decision card UI);
- `core/Page/weight` and `rank()` (proposal-flow);
- the multi-model rating from [openrouter-harness](/framework/ai/sessions/2026/10/01/openrouter-harness/openrouter-harness/) phase 2, item 5.

## Deliverables
- The documented path above, as content cards the owner can read, simply named, with structure and drill-down.
- Decision tables as a content widget.
- The skill text: agents produce the shape, the decisions, the ranked options and the tables in their normal work, cheaply.
- One real task shown end to end as the example.


## Added 2026-10-01 (00:25)
- **Agents write their decision tree AS they work:** each major decision, the alternatives, the one picked and why, the pros and cons. It costs a few more tokens and buys real insight into the reasoning. It's browsable by the owner (who may weigh in before or after; never blocking) and by later models.
- **A ranked list IS the decision.** Rank the options by weight, take the top one, and proceed in real time.
- **Shape rule (code):** stay one-to-one with the underlying technology (the DOM, the platform APIs). Never add a layer that only re-wraps an existing API with no added function. Send it to the code system (/framework/code/) through the architect.

## Added 2026-10-01 (00:40): investigation first, and consensus as near-fact
- **Every prompt, question, task or objective breaks down the same way:**
  1. a title (its name);
  2. its core pillars or principles (with sub-parts);
  3. for each pillar: the major decisions, the factors and the caveats.
- **INVESTIGATING is the first phase, before planning:** what do we know to be true? Ask several models to state facts, and keep the statements most of them agree on (e.g. "you can't do A and B at once": mutually exclusive choices).
- **Decision dependency trees:** "if you choose this format or library, these consequences follow; if you choose that one, those". Models can weigh in on a whole design tree before any code is written. It can run to hundreds of sub-trees, so it must be an iceberg UI: a title, a summary and the weight on top, and you click in only if you care.
- **Consensus as near-fact:**
  - a statement with overwhelming agreement (above 90%) is near-fact;
  - one with overwhelming disagreement (below 10%) is a near-certain "don't".

  Write these as strong rules ("probably always" or "probably never"), but not as absolutes; rare edge cases exist. The thresholds are arbitrary and tunable. Note: this is an AGREEMENT score (0–100% of models), shown beside the weight (the multiplier around 1). Keep the two distinct.
- **Cheap extraction:** give each model a minimal, self-contained input and ask how it would solve or fix X. Get the most knowledge per token.

## Added 2026-10-01 (01:20): the consensus footgun
Voting has a hidden cost. If 10 agents each plan a system and a vote picks one, the other nine are never built, and their useful ideas can die with them.
- **Harvest:** after the vote, a pass pulls the best ideas from the losing plans into the winner.
- **Sometimes let 2 finalists evolve a step or two before deciding,** when the vote is close (high spread) and the decision is foundational.
- Measure whether harvesting pays off, so we learn when a fan-out is worth it.
