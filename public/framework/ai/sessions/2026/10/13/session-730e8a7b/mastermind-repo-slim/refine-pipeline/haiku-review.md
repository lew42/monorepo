# Opus review of Haiku's refinements: 10 prompts, brief v1 then v2

**v2 is the shape the queue keeps: mean coverage 0.96 against v1's 0.90.** Each product is one owner prompt refined by one Haiku call ([`Server/RefineQueue.mjs`](/Server/RefineQueue.mjs)); the brief is [`RefinedCard.BRIEF`](/framework/ext/Refine/RefinedCard.js). I read every raw prompt (numbered sentences) beside its asks.

**Score** = faithful asks ÷ (asks really in the prompt + asks the product invented). A dropped want, a hedge turned into a must, or a misread referent counts as not faithful. **Confidence** in each score is 0.7 on the 0.5 scale (0.5 = not sure; my judgment of what counts as an ask in a ramble is itself a reading).

| # | prompt (session:transcript line) | chars | v1 | v2 | what moved |
|---|---|---|---|---|---|
| 0 | 730e8a7b:728 | 15,360 | 0.97 | 0.95 | v2 merged 63 asks into 35 with the detail kept in each; dropped "re-check the existing 0.9 weights" (S80–81) and invented a mic-button placement from narration |
| 1 | f155ecbd:3516 | 5,843 | 0.94 | 0.95 | v2 kept the sidebar's expand/collapse detail; both lose the hedge on "spawn Sonnet minions" |
| 2 | 87bec773:3959 | 5,752 | 0.91 | 0.92 | both read "find one home for the rules" as the ask, though the owner was restating the agent and pushing back |
| 3 | 7efd07d5:603 | 6,775 | 0.96 | 0.97 | v2 keeps "architecture.md may run longer than 100 lines" |
| 4 | f155ecbd:5042 | 2,565 | 1.0 | 1.0 | — |
| 5 | 87bec773:10670 | 1,327 | 0.5 | 0.8 | v1 read "our own name for this tab" as renaming the Sessions page and invented two asks from narration; v2 gets the referent and drops one invention |
| 6 | 87bec773:3752 | 1,241 | 0.88 | 1.0 | v2 no longer turns "I clicked the same card" into a bug report |
| 7 | 87bec773:2689 | 2,836 | 1.0 | 1.0 | — |
| 8 | 87bec773:12064 | 550 | 0.83 | 1.0 | v2 follows the self-correction ("CLAUDE.md, oh well, probably the mastermind skill") |
| 9 | 87bec773:3351 | 107 | 1.0 | 1.0 | — |
| | **mean** | | **0.90** | **0.96** | |

## What v2 changed (and why)

v1 rarely **dropped** detail; it **distorted** it. The four failure modes became four lines in the brief, plus "list every specific first":
- a self-correction wins;
- what the owner describes seeing is evidence for an ask, never an ask of its own;
- when the owner restates the agent's idea and pushes back, the ask is the pushback;
- name the exact thing the owner means.

Still open, and why they stay: hedges on spawning minions survive in both versions (a rule already says hedges stay hedged; one more line has not paid off yet), and the restated-idea case (#2) needs the agent's previous message to judge, which a one-prompt call never sees. The click-through to the raw prompt on the session page is the answer for both: the reader sees the sentences an ask cites.

## Cost

Both runs paid ~$0.17–0.18 a prompt because every call carried ~8k tokens of the project's auto-memory; with `cwd` outside the repo the same call is ~$0.002 plus the prompt (measured, `task.jsonl` experiment line). v1 $1.75, v2 $1.81; biggest call 30,785 tokens (v1, #0), well under 100k.
