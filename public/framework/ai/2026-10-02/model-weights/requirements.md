# Model weights: what each model is worth

Requirements for a Models tab: a data grid that ranks every model we've tested, by evidence, not opinion. Budget: $12, queued until the task-audit pilot proves the method (it reuses the pilot's data).

## The owner's brief (2026-10-02, trimmed to one idea per bullet)
- **The weight is a composite, named, not hidden.** "Break weights down into components and compute the composite algorithmically, or just put named weights next to the weight." A model's weight can itself be a composite of its configurations (effort, temperature).
- **Models form a tree.** "Trees of models: families with sub-models."
- **The hard part is truth.** "What is the truth? Did it do well or poorly?" The owner wants structured values that compare mathematically — integers, explained verbally (rare, outlier, extremely rare) — covering completeness, obedience, and whether there was a review; plus plain lists of best and worst parts.
- **Consensus outranks any one opinion.** "It's still opinion, so it's the CONSENSUS that matters, across providers, not just Anthropic."
- **The Models tab itself.** "A data grid of every model we've tested, sorted by the best, filterable: overall, best cheap, best expensive."
- **A simple failure may be ours, not the model's.** "If even the most basic tasks failed, maybe our system failed: the skills didn't load, or the instructions are bad. A simple syntax error could be fixed by a code reviewer."
- **Incidents are negative weight, and the owner stays in the loop.** "A model that makes simple errors gets that noted as an incident: a negative weight. I want to be in the loop judging how serious it is, because models update and change."

## 1. Truth, in this order (what outranks what)
1. **Machine checks:** URLs return 200, `node --check` passes, the named files exist, tests pass, zero console errors in a headless load. These are facts.
2. **Cross-family consensus:** the median of auditors from at least 3 DIFFERENT providers (e.g. Anthropic, DeepSeek, Google/OpenAI). Agreement is a signal; one model's opinion is not.
3. **The owner's verdict** on disputes: a task where the auditors disagree (agreement under 60%) or contradict a machine check goes to the Inbox as one card with a −3..+3 picker.

## 2. Weights are named parts plus a computed composite
- Every run records named scores (−3..+3 integers with verbal anchors: 0 = typical, ±1 = common, ±2 = rare, ±3 = extremely rare): `complete`, `obedience`, `quality`, plus the machine checks and the cost.
- **A model's weight = the mean of its runs' z-like scores**, shown WITH its parts beside it (named weights, not a hidden formula). The composite rule lives in one function in `models.mjs`, so changing it re-ranks everything.
- **Value = weight ÷ cost** (per run), shown as its own column. It's never mixed into the weight.

## 3. The model tree
`family → model → config` — for example Anthropic → Sonnet 5 → effort medium, or DeepSeek → V4 Pro → temperature 0.2. Runs attach to the leaf config.
- **A parent's weight is a roll-up**, weighted by run count, and shown with that count — so a model tested twice can't outrank one tested twenty times without it showing.
- **Configs are split out only when it's a close call** between them (budget).

## 4. Incidents: negative weight, the owner in the loop
- An incident is one line in `incidents.jsonl` beside models.json: `{"incident": {"at", "model", "config", "kind": "syntax|image-crash|tool-format|ignored-skill|…", "task", "evidence"}}`, written by node when a machine check fails.
- Each open incident subtracts a fixed amount from the model's weight. The Models tab lists incidents with **Dismiss** (doesn't count) and **Serious** (counts double). Incidents older than 30 days fade by half, because models change.

## 5. First, check that OUR system isn't what failed
- **Most free models failed the easiest rung** (h1-page) on the ladder. Before trusting that, read 3 failing transcripts and classify the cause: the model, OR the harness (skills not loaded, tool-call format, image blocks, the brief).
- **Fix any harness cause, then re-run that rung once.**
- **Check for a syntax slip before judging logic.** Run `node --check` and a lint pass on every run first; a pure syntax slip gets fixed by a cheap fixer and logged as a `syntax` incident, so the run's actual logic is still judged.

### Evidence found already (vscode-mastermind, 2026-10-02): the system is at least partly to blame
- **Nemotron Ultra (free) PASSED h1-page,** but its page was written in worktree `qf-7`, whose 33 commits never reached michael/dev. Nobody climbed it to rung 2.
- **The finished Nemotron agent was then woken 9 more times** by heartbeat status checks and revives (agent-minion-lib-h1-page.jsonl). Its recorded cost went from $0 to **$2.84**, so the revive seems to have dropped the OpenRouter provider and run on a Claude model. Check this in Servex (revive must keep `provider`), and stop finished agents (the token-reduction task).
- **The failing free runs left no file and no Servex agent log.** They ran outside Servex (through `library.mjs`?). Find their transcripts and classify the cause: tool-call format, rate limit (429), the model, or the brief.
- **The Page readme had no "make a page" recipe at the top.** It does now (core/Page/readme.md, "Make a page"). Re-run h1-page on 3 free models once the harness causes are fixed.

## 5b. Tests are a flag on a task, with a schema that fits the question
- **Any task can be a test:** `spawn_agent` takes `test: {compare: ["sonnet", "<openrouter model>"], schema: "<name>"}`. Servex runs the same brief on each model in its own worktree, and both write the structured result. Only the mastermind's chosen result merges. The pair is recorded as one test run.
- **The schema fits the question** (not −3..+3 everywhere): booleans for facts (did it load? did it follow the skill?), −3..+3 integers with word anchors for judgments, enums for categories, and short lists (best 3, worst 3, missing items). Schemas live in one file (`schemas.mjs`) and are validated like any JSONL line.
- **Agreement is the signal:** two runs that agree on a strong value (±2 or ±3), or name the same missing item, count as evidence. A disagreement is noise unless a machine check settles it.
- **Identification tasks are the cheap models' sweet spot:** "find every place that does X" has a checkable answer (a list of paths and lines). Build a few with a known answer (seeded from a grep), so a model's recall and precision is a fact, not an opinion.
- **Fewer requests:** free models are limited per request, and each tool call is a request. For cheap models, inline the files the task needs into the prompt (a preloaded brief), so the model answers in one or two requests instead of twenty.

## 6. The Models tab on /framework/ai/
A data grid (Panel 2 + the filter system): model, family, provider, config, runs, weight (with parts on hover), value, price, incidents. Sorted by weight. Filters: family, provider, price band (free / cheap / expensive), min runs. Default views: Best overall · Best cheap · Best value. It replaces nothing: [/framework/ai/system/models/](/framework/ai/system/models/) (the ladder) becomes one of its views.

## Rules
A Sonnet task mastermind. Reuse models.mjs, models.json, reconcile.mjs and the openrouter harness; don't build a second one. Never wait on the owner.

## No model is written off from one round (the owner, 2026-10-02)
- The audit pilot was ONE round: 5 tasks, 4 judges. Each judge scored the TASKS independently; the consensus is the median of all four, and a model's "distance" is how far its scores sat from that median (its own score included, a small bias). That is a hint, not a verdict.
- A model's weight shows its run count, and the Models tab marks anything under about 20 judged runs as provisional.
- Every judge's raw answers stay one click away (each task's audit.jsonl), so the owner can read what each model actually said and judge for themselves.
- Routing keeps rotating: the favoured model takes most of the cheap work, but others still get a share, so their scores keep updating. A model is avoided only when the problem is clear and repeated (incidents, machine checks), never because one round ranked it low.
