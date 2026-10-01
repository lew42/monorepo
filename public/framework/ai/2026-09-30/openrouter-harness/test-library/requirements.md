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
