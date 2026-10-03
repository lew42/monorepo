# Model weights: what each model is worth, from evidence, on a Models tab: requirements

Budget: $12 (queued after the task-audit pilot proves the method; it uses the pilot's data).

The owner, 2026-10-02 (trimmed): "the essence of the task audit, or any of the LLM tests, is the weight of the model… break weights down into components and compute the composite algorithmically… or just put named weights next to the weight… a model's weight could be a composite of its thinking levels or other configurations (effort, temperature)… trees of models: families with sub-models… The hard part is: what is the truth? Did it do well or poorly?… structured values you can compare mathematically… integers carry more weight, explained verbally (rare, outlier, extremely rare)… completeness, obedience, was there a review… lists: best parts, worst parts… it's still opinion, so it's the CONSENSUS that matters, across providers, not just Anthropic… a Models tab: a data grid of every model we've tested, sorted by the best, filterable: overall, best cheap, best expensive… If even the most basic tasks failed, maybe our system failed: the skills didn't load, or the instructions are bad. A simple syntax error could be fixed by a code reviewer… a model that makes simple errors gets that noted as an incident: a negative weight. I want to be in the loop judging how serious it is, because models update and change."

## 1. Truth, in this order (what outranks what)
1. **Machine checks:** URLs return 200, `node --check` passes, the named files exist, tests pass, zero console errors in a headless load. These are facts.
2. **Cross-family consensus:** the median of auditors from at least 3 DIFFERENT providers (e.g. Anthropic, DeepSeek, Google/OpenAI). Agreement is a signal; one model's opinion is not.
3. **The owner's verdict** on disputes: a task where the auditors disagree (agreement under 60%) or contradict a machine check goes to the Inbox as one card with a −3..+3 picker.

## 2. Weights are named parts plus a computed composite
- Every run records named scores (−3..+3 integers with verbal anchors: 0 = typical, ±1 = common, ±2 = rare, ±3 = extremely rare): `complete`, `obedience`, `quality`, plus the machine checks and the cost.
- **A model's weight = the mean of its runs' z-like scores**, shown WITH its parts beside it (named weights, not a hidden formula). The composite rule lives in one function in `models.mjs`, so changing it re-ranks everything.
- **Value = weight ÷ cost** (per run), shown as its own column. It's never mixed into the weight.

## 3. The model tree
`family → model → config` (for example Anthropic → Sonnet 5 → effort medium; DeepSeek → V4 Pro → temperature 0.2). Runs attach to the leaf. A parent's weight is a run-count-weighted roll-up, shown with its run count, so a model tested twice can't outrank one tested twenty times without it showing. Configs are tested only when a model is a close call (budget).

## 4. Incidents: negative weight, the owner in the loop
- An incident is one line in `incidents.jsonl` beside models.json: `{"incident": {"at", "model", "config", "kind": "syntax|image-crash|tool-format|ignored-skill|…", "task", "evidence"}}`, written by node when a machine check fails.
- Each open incident subtracts a fixed amount from the model's weight. The Models tab lists incidents with **Dismiss** (doesn't count) and **Serious** (counts double). Incidents older than 30 days fade by half, because models change.

## 5. First, check that OUR system isn't what failed
The ladder found most free models fail even the easiest rung (h1-page). Before trusting that, read 3 failing transcripts and classify the cause: the model, OR the harness (skills not loaded, tool-call format, image blocks, the brief). Fix any harness cause and re-run that rung once. Also: before judging a run, run `node --check` and a lint pass. A pure syntax slip gets fixed by a cheap fixer and logged as a `syntax` incident, so the run's logic is still judged.

## 6. The Models tab on /framework/ai/
A data grid (Panel 2 + the filter system): model, family, provider, config, runs, weight (with parts on hover), value, price, incidents. Sorted by weight. Filters: family, provider, price band (free / cheap / expensive), min runs. Default views: Best overall · Best cheap · Best value. It replaces nothing: /framework/ai/system/models/ (the ladder) becomes one of its views.

## Rules
A Sonnet task mastermind. Reuse models.mjs, models.json, reconcile.mjs and the openrouter harness; don't build a second one. Never wait on the owner.
