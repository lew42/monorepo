## Research, in one screen ([/framework/ext/Research/](/framework/ext/Research/))

**What it is:** several minions dig into one question, each writing short statements to a shared log file. A page shows the log live, conclusions first.

### Two shapes

| shape | what it is | example |
|---|---|---|
| **Topic** | one question, argued in rounds, then closed with a verdict | [LiveReload](/framework/research/livereload/): 52 statements, 7 minions |
| **Program** | several subjects, dug continuously and never closed | [Ancient technology](/imagine/research/): 4 subjects |

### How a topic runs

```
you ask a question
  │
  ├─ round 1: scouts (Sonnet, in parallel)  → each adds up to 8 claims, with sources
  ├─ round 2: skeptic (Opus)                → checks each claim: support or dissent, WHY required
  │           builder (Sonnet)              → proposes alternatives, with cost
  │           everyone                      → votes importance (a true but trivial claim = 1)
  └─ orchestrator                           → a verdict per claim: accepted / rejected / parked / merged
                                            → a summary of 7 lines or fewer: the answer
```

A minion never reads the whole file. It reads the **outline**, a compact tree of what's already been said, so it doesn't repeat anything and its context stays small. Nothing is deleted: a weak claim sinks to the bottom.

### What one statement is

| field | meaning |
|---|---|
| kind | question · claim · evidence · support · dissent · alternative · note |
| why | required on support and dissent: the reasoning, not just a vote |
| importance | voted, so nitpicks sink |
| **credence** (program shape only) | established · contested · fringe · speculation. "Established" with no source link is refused |

### Output

**A page, live:** the summary on top, then every claim as a card that opens to show its support and dissent. That page is the report.

### Your idea vs. what's built

- [x] A fleet of minions, reading sources, arguing, refining
- [x] Confidence on every statement (credence), never upgraded by the page
- [x] Reasoning required for every agreement or disagreement
- [ ] **Logic and truth judged separately.** Is the argument valid? Are its premises true? Is it a useful idea even if wrong? Today one "support/dissent" covers all three.
- [ ] Web search built into the rounds. The LiveReload topic researched code; Ancient technology used the web, by hand.
- [ ] A box on the page where you ask the question or push back
- [ ] A script that runs the rounds by itself. Today an orchestrator runs each round.
