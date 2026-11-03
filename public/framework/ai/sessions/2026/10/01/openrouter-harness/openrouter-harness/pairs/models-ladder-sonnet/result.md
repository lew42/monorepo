# Result: models-ladder-sonnet

Built "The cheap ladder" section on the Models page ([/framework/ai/system/models/](http://127.0.0.1:63880/framework/ai/system/models/)), placed above the existing "Value per configuration" chart, as asked.

**What it shows:** one row per model that has attempted at least one of the four rung tests (h1-page, fix-label, broken-import, broken-overflow), cheapest first with free models at the top. Columns: model, $/1M tokens in, $/1M tokens out, pass/fail/dash per rung, mean $ per run, and price × Sonnet. One sentence above the table names the cheapest model that passed all four rungs — today that's `claude-haiku-4-5-20251001` (the only free/cheap models tried so far only ran `h1-page`, and most of them failed it).

**Files changed** (all inside my fence, committed in the worktree — not merged):
- `Servex/ext/openrouter/evals/models.mjs` — added `buildLadder()`, writes a new `ladder` block into `models.json`.
- `public/framework/ai/overview.js` — added `render_ladder()`, called at the top of `render_models()`.
- `public/framework/ai/system/models/models.json` — regenerated output (includes the new `ladder` block).

**What works:** `node --check` passes on both edited files; `node Server/smoke.mjs . /framework/ai/system/models/` exits ok (only pre-existing, unrelated 404 warnings for `usage.json` and `:8090/card`); screenshots at 1200px and 400px are in this folder (`shot-1200.png`, `shot-400.png`) and show the table rendering correctly.

**What doesn't / what's left:** at 400px the table scrolls horizontally rather than reflowing — that's the framework's existing behavior for wide data tables (`framework.css` gives `table` `width: max-content`), not something I changed. Pass/fail per rung is lenient: if any attempt by a model at a rung passed, it counts as a pass for that rung (logged as a decision in task.jsonl). No model besides the three Claude controls has run all four rungs yet, so the ladder's main finding today is simply "free models have only been tried on the easiest rung, and most fail it."

Did not run `merge.mjs` and did not spawn any minions, per the brief.
