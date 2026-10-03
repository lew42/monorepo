# Task audit: cheap models grade finished tasks and rank themselves: requirements

Budget: $8 for the pilot (Sonnet mastermind about $4, OpenRouter minions about $3, one Sonnet reference audit about $1).

The owner, 2026-10-02 (trimmed): "ask any number of minions to do a very structured, simple task… an audit of the tasks that have been asked recently… determine what was done and whether it accomplished what the prompt requested… a post review. Also look into whether any review was done and whether it was done accurately… less about the abstract opinions of each minion… if most of the minions come back with strong signals about which tasks actually failed, that's what we want… rank the value of each task based on how much was spent and whether it was completed… put an audit file into each task directory… the most robust storage system… start small and keep usage to a minimum until we prove it works… only review tasks that have finished… check if a review has already been done… does it have an appropriate task name? an appropriate task icon?… the log should be able to filter through all the tasks… cost loadable… value, maybe divided by the cost, normalised… simple structured answers and then the consensus… completion, utility, dependents and dependencies."

## Storage: `audit.jsonl` in each task dir
- Append-only, one line per auditor, written ONLY through `.claude/hooks/append.mjs` (add an `audit` schema to `jsonl-schema.mjs`):
  `{"audit": {"at", "by": "<agent id>", "model": "<model id>", "cost_usd", "complete": -3..3, "matches_ask": -3..3, "utility": -3..3, "review": "none|accurate|missed-failures|wrong", "name_ok": bool, "icon_ok": bool, "missing": ["<a requested item not delivered>", …], "evidence": ["<path or url checked>", …], "depends_on": ["<task slug>"], "notes": "<one line>"}}`
- **Scores are whole numbers from -3 to +3** (the owner, 2026-10-02: the standard-deviation scale). **0 = what you'd expect**: the ask was met, nothing more. ±1 = normal variation (a small gap, or a little extra). ±2 = a strong outlier. ±3 = extreme (−3: nothing usable was delivered; +3: far beyond the ask, verified). Auditors pick an integer, never a decimal. The anchors for each field are written at the TOP of every minion's brief. Notes are one line. No essays.
- **Consensus is computed by node (law 7):** `audit.mjs` reads every audit.jsonl and writes the consensus per task: the median of each score, the agreement (the share of auditors within ±1 of the median), and the union of `missing` items that 2+ auditors named. **value = q ÷ max(cost, $1)**, where q = ((complete+3)/6) × ((utility+3)/6) is a 0–1 quality factor, so a big number can't run away. A consensus score of −2 or below on `complete` or `matches_ask` flags the task as FAILED.
- **The models are judged by the same data:** each model's distance from the consensus (and from the Sonnet reference audit) across the pilot tasks is its score. This feeds the existing model ladder at /framework/ai/system/models/.

## The pilot (start small)
1. Pick **5 landed tasks** from 2026-10-01/02 that have a requirements.md and an owner-words.md (prefer ones with a review report, so `review` can be checked). Include `ai2-inbox-read` (the rm -rf incident) as a known failure.
2. **3 cheap OpenRouter models** (DeepSeek V4 Pro plus two from the ladder's cheap rungs) plus **1 Sonnet reference**. Each audits all 5 tasks: one minion per model, tasks in sequence, a text-only brief (never open images: the harness kills text-only models on a .png).
3. Each minion reads only: the task's requirements.md, owner-words.md, task.jsonl (outcome and landed lines), any review report, and `git show --stat` for the commits the task names. It checks one or two claimed URLs with curl (200 or not).
4. Run `audit.mjs` and write `report.md`: one screen. Which tasks failed by consensus, which reviews missed it, the value per task, and the model ranking. Post it on the card.
5. **Go/no-go:** if the consensus catches the known failure and the models agree at least 70% of the time, propose scaling up (all landed tasks since 09-30, cheapest models only) with a cost estimate. Don't scale without that line on the card.

## Rules
- A Sonnet task mastermind. Reuse the OpenRouter harness (Servex `provider`, `reconcile.mjs` for real cost, the cheap-model rules in the openrouter-harness report). Don't build a second harness.
- Write audit.jsonl only through append.mjs. Never edit a task's other files.
- Never wait on the owner.
