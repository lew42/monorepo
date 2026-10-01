# Minion brief: the test library, first five tests

Load the `minion` skill first. Parent: `task-mastermind-openrouter`. Read the parent's
`requirements.md` "Phase 3" section and the last section of `owner-words.md`
(`public/framework/ai/2026-09-30/openrouter-harness/`).

## Why
The owner wants to know which model is good enough, and cheapest, for each kind of task. A test
library is a folder of small tasks, each with a known good outcome. Strong models set the
reference by agreeing; a judge scores every other run against that reference.

## Reuse; don't build a second one (CLAUDE.md law 6)
- **Spawning and waiting:** copy `Servex/ext/openrouter/evals/rules.mjs` (spawn one Servex agent,
  wait, stop it, one at a time). It already makes a fresh run dir under a task dir, so the run's
  page loads at `monorepo.localhost/framework/ai/...`.
- **Cost:** never read `cost` at turn end; it is 0 until billing settles. Read the agent's lines
  in `%LOCALAPPDATA%\lew42\servex\logs\openrouter.jsonl` (keyed by agent id), polling up to 40 s.
  Claude models on the subscription: use the agent's own `cost`.
- **Results:** one line per run in `Servex/ext/openrouter/evals/results.jsonl`, the same `probe`
  shape the rule tests and the probes use, plus `"score": "terrible"|"ok"|"great"` and `ms`.
  Append through `node .claude/hooks/append.mjs`.
- **The planning test's output** uses the decision format: the agent runs `Server/decide.mjs`
  (the `decide` skill). Don't invent a planning format.

## Deliverables
1. **`Servex/ext/openrouter/evals/library/`**, one folder per test: `test.json`
   (`id, kind, skills[], requirements[]` (complexity = how many), `prompt`) plus a `fixture/`
   folder that is copied into the run dir. Five tests:
   - `broken-overflow` (kind broken-page; CSS, layout): a page whose content runs off the right
     edge at 400px. Prompt: "Study this page's layout and say what's wrong with it." One cause.
   - `broken-import` (kind broken-page; JS): a page that throws at load because of one wrong
     import path. Prompt: "This page doesn't load. Fix it."
   - `new-page-glossary` (kind new-page; JS, OOP, HTML, naming): "Write a new page here: a
     glossary of five web terms." 4–5 checkable requirements, e.g. parses, loads clean, built in
     house style from JS, uses the page skill's shape, linked from its parent.
   - `fix-label` (kind quick-fix; JS): a page with one self-evident bug (e.g. a button labelled
     "Sumbit"). One right fix; nothing else in the file changes.
   - `plan-counter` (kind planning; system design, OOP, naming): "Before any code: propose the
     shape of a small click-counter module (files, classes, names). Give 2–3 options with pros
     and cons, and pick one." Through decide.mjs.
   Make each fixture tiny. Check every broken fixture really is broken (load it headless once).
2. **`Servex/ext/openrouter/evals/library.mjs`**:
   `node .../library.mjs --models a,b [--effort low] [--only id] [--judge]`. Each run appends
   one result line. Mechanical checks (parses, loads clean, untouched files, hashes) run by
   script. `--judge` spawns one judge agent (`claude-opus-5-5`, medium effort) per test. The
   judge reads that test's `reference.md` and every unscored run, then writes the scores as new
   result lines, with a one-line `note` each.
3. **The reference, by consensus.** Run the five tests on the strong set, once each:
   `claude-opus-5-5`, `claude-sonnet-5`, `openai/gpt-6-sol`, `google/gemini-3.1-pro-preview`.
   Then the judge writes `library/<id>/reference.md`: the key elements at least 3 of the 4 agree
   on (most important first), what they disagree on, and the agreement rate. A test where fewer
   than 3 agree gets no reference; note why in its file.
4. **Then the cheap set at low effort:** `openai/gpt-6-luna`, `deepseek/deepseek-v4.1-flash`,
   `google/gemini-3.8-flash`, plus `claude-haiku-4-5-20251001`. Judge them.
5. **Docs:** a short "Test library" section in `Servex/ext/openrouter/readme.md`: one command,
   where the results land, how to add a test.

## Fence
Work in the worktree `C:/Code/lew42/worktrees/qf-7` (commit after each piece; the parent
merges). Write only `Servex/ext/openrouter/evals/library/`, `evals/library.mjs`, the readme
section, and this task dir (runs go under `test-library/runs/`). Another minion edits
`evals/rules.mjs`: don't touch it. Never read, print or log the OpenRouter key. Every process
you spawn uses `windowsHide: true`. Servex refuses OpenRouter spawns past the daily cap; if it
does, stop and report.

## Budget
OpenRouter spend for this brief: about $4 at most. Check `/api/v1/key` usage through
`provider.js` `key_usage()` before the strong set and after it. Reply to your parent with: the
results table (test × model: score, $, s), the reference agreement rate per test, the commit
hashes, and anything that looked like a harness failure (label c).

## Amendment: Phase 4 folded in (no new tests)
Read the parent's "Phase 4". Four small changes to the same five tests:
1. **Price as a multiplier.** The table shows each model's price as a multiple of `claude-sonnet-5`
   ("0.1×"), from the public `GET /api/v1/models` prices, computed when it prints. Keep the
   per-run `cost_usd` too.
2. **The routing table.** `library.mjs --route` reads results.jsonl (newest line per
   model × effort × test wins) and writes `evals/routing.json`: for each test kind, the cheapest
   model + effort whose runs score at least `ok`, with its multiplier and the evidence (runs,
   scores). Recomputed from scratch on every run, so it updates as results arrive. Nothing reads
   it yet.
3. **Two scores.** The judge's `score` is the outcome (primary). When a run wrote a decision
   record (decide.mjs; at least plan-counter), the judge also writes `reasoning`:
   terrible|ok|great, plus a one-line note. A sound decision record with a missed outcome is
   worth flagging.
4. **Replay a landed task.** `test.json` may carry `from_task: "<ai/... task dir>"`, meaning the
   prompt and accepted outcome come from that landed task. Document it in the readme's
   "how to add a test". Don't add such a test now.

## Amendment 2: Phase 5, the ladder (this REPLACES the test list in deliverable 1)
Read the parent's "Phase 5". Still five tests, now ordered as rungs, easiest first:

| rung | test | replaces | what it checks |
|---|---|---|---|
| 1 | `h1-page`: "Make a page here with an H1 that says <X>." | new-page-glossary | reads the skills, writes a page.js in the page skill's shape, the H1 renders in the right place. Every model should pass: this is the floor |
| 2 | `fix-label` | (same) | one self-evident fix, nothing else changed |
| 2 | `broken-import` | (same) | finds and fixes the one wrong path |
| 3 | `broken-overflow` | (same) | names the one cause |
| 4 | `plan-views`: "Suggest three object-oriented architectures (class signatures, methods, how they talk) for a small <system with 3 named classes doing X, Y, Z>, in our style: a jQuery-like object-oriented View library, no virtual DOM, no React-style reactivity. Pick one." Through decide.mjs. | plan-counter | system design, OOP, naming; plus the reasoning score |

- **Minimal context.** Each prompt names only the files it needs (for plan-views, the View
  module's readme and nothing else). Don't paste the codebase into a prompt.
- **Bad tests get dropped.** If the strong set disagrees on a test (fewer than 3 of 4), fix it or
  drop it; don't score cheap models against it.
- **Climb, don't sweep.** Run every model on rung 1. Then run the next rung. Stop raising the
  difficulty once some cheap models fail. One run per model per test. Strong set:
  `claude-opus-5-5`, `claude-sonnet-5` (subscription, never through OpenRouter), `openai/gpt-6-sol`,
  `google/gemini-3.1-pro-preview`.
- **Look for the cheap gems.** On top of the cheap set, add the two cheapest tool-capable models
  from `/api/v1/models` (older ones count) to rungs 1 and 2 only.
- **The reply** leads with one small table: model · rung · pass (n/n) · $/run · price multiplier
  vs Sonnet. Then the agreement rate per test, and anything labelled c.

## Amendment 3: Phase 7, the pace and vision (read the parent's "Phase 7")
- **The pace is now a hard limit:** $1.50/day and $10/week of OpenRouter (the spend guard refuses
  past either). Today and this week are already at $7.49, so **no OpenRouter runs until the UTC
  day resets (00:00 UTC = 19:00 local)**, and then about $1.50 a day with $2.51 left until Monday.
  Run the Claude parts now (Opus, Sonnet, Haiku, on the subscription). Queue the OpenRouter parts
  for after the reset, cheapest first: the strong OpenRouter pair (gpt-6-sol, gemini-3.1-pro)
  only on tests where Opus and Sonnet disagree with each other.
- **Your OpenRouter budget is now $1.50 a day, not $4.**
- **Vision, the next rung after the ladder:** `ui-fouls`. Make 3 screenshots with KNOWN fouls,
  each planted in a tiny fixture page: text touching a background or border edge with zero
  padding (the canonical one), content overflowing at 400px, and one low-contrast pair. Prompt:
  "Describe this UI, then name its worst design fouls, most serious first." Benchmark: Opus.
  Score: did it find each planted foul, and did it invent any that aren't there? Sample 4–6
  configs, the cheapest vision-capable ones first (check `architecture.input_modalities` in
  `/api/v1/models`). Note any model that can't take an image at all.

## Amendment 4: Phase 9 (read the parent's "Phase 9"); keep it small
- **Thinking level:** every model runs at `medium` (not `low`). Add 25% and 75% points only where
  a result is borderline while other models score high. Use min and max only to prove a test
  discriminates (it fails at min and passes at max). Never sweep.
- **`AITest`, one class:** `public/framework/ai/test/AITest.js`, a plain data class that node and
  the browser can both import (no DOM, no node-only imports). It has `id, kind, skills, rung`, a
  prompt FILE (`prompt.md` beside the test), `criteria[]`, `expected`, `judge` (instructions)
  and `confidence` (0..1: how sure we are the test is good, raised when the strong models agree;
  the judge sets it when it writes `reference.md`). Each `library/<id>/test.json` becomes the
  data for one instance. `library.mjs` reads the prompt from the file and spawns from it, so no
  one re-types a prompt. Don't build a second runner: library.mjs is the runner.

## Amendment 5: Phase 10 (read the parent's "Phase 10"). An AITest is a PAGE
- **Move the class** to `public/framework/ai/tests/AITest.js`, a page class the way AI 2's
  `/framework/ai2/card.js` is one. Look at how a card's `page.jsonl` line 1
  (`{"class": "/framework/ai2/card.js", …}`) makes PageLog load that class, and do the same.
  Never use `core/Item` / `Item.register`.
- **Each test is a folder** `public/framework/ai/tests/<slug>/` holding `page.jsonl`, whose line 1
  is `{"class": "/framework/ai/tests/AITest.js", "title", "kind", "rung", "skills", "prompt":
  "prompt.md", "criteria", "expected", "judge", "confidence"}`, plus `prompt.md` and `fixture/`.
  `Servex/ext/openrouter/evals/library/` goes away; `library.mjs` reads the tests from there.
- **Each run is one line appended to its test's page.jsonl** (through append.mjs): the same
  fields as the results line (model, effort, pass, score, reasoning, cost_usd, ms, note).
  results.jsonl keeps only the rule tests and the probes. The Models page reads both.
- **`/framework/ai/tests/`** is a small index page whose `children:` names each test (nothing
  crawls). The test page shows its prompt, criteria and confidence, then its runs as a table.
  Load the `page` and `new-page` skills first; check it at 400 and 1200.
- **The default sample:** the NEWEST version of each family at MEDIUM thinking. Write it down if
  an older version beats a newer one.
- Move the existing tests and their runs over. Don't rerun anything for the move.
