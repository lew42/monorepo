# openrouter — rule tests and the test library (moved from the readme)

<!-- moved verbatim from readme.md lines 20-96, 2026-10-12 readme audit -->
### Rule tests — can a cheap model follow our own instructions?

Five small tests, each with exactly one right answer a script checks (never a judge's opinion):
reading CLAUDE.md, following the readme chain, calling our tools, appending the house way
(through `append.mjs`, not a shell write), and staying inside a fence even when the brief itself
tempts it to stray. One real Servex agent is spawned per model × effort × test, in a fresh temp
task dir under `rule-tests/runs/`.

```
node Servex/ext/openrouter/evals/rules.mjs --models claude-haiku-4-5-20251001,deepseek/deepseek-v4.1-flash --effort low,high
```

Default (no flags): one model, `claude-haiku-4-5-20251001`, at `low` effort — the safe dry run
before an OpenRouter model is allowed to spend anything. All five pass on it today. Results land
as one `{"probe":{...}}` line per run in
[`evals/results.jsonl`](./evals/results.jsonl) — the same file and shape
mastermind-servex-9's probe runner uses (`public/framework/ai/sessions/2026/09/30/probe-tasks/probes.md`),
so a rule test and an open-ended probe sit in one shared table instead of two parallel ones.

### Test library — real work, not one right answer

Rule tests (above) check whether a model follows our own rules. The test library goes one step
further: a climbing ladder of small real-work tasks (rung 1, the floor every model should pass, up
to rung 4, system design) — a broken page to diagnose, a broken page to fix, a new page to write, a
one-word bug to fix, a plan to write before any code. **Each test is a real page**
([`#AITest`](/framework/ai/tests/AITest.js)), not a script-only folder:
[`/framework/ai/tests/`](/framework/ai/tests/) shows every test, its prompt, its criteria and every
run it has had — open it and click one, the same as any other page on the site. Each test's folder
(`public/framework/ai/tests/<id>/`) holds `page.jsonl` (line 1 names `AITest.js` as its class, the
same shape AI 2's card uses), `prompt.md`, and a `fixture/` with whatever files the agent should
start from. There's no single right answer to "fix this page", so a script checks what it CAN check
(does the result parse, does it load with no console error, did the untouched files stay untouched)
and a judge model scores the rest.

```
node Servex/ext/openrouter/evals/library.mjs --models claude-haiku-4-5-20251001,deepseek/deepseek-v4.1-flash --effort medium
node Servex/ext/openrouter/evals/library.mjs --judge   # scores every run with no score yet
node Servex/ext/openrouter/evals/library.mjs --route   # rebuilds the model+task matrix
```

Every run appends one `{"run":{...}}` line to THAT TEST's own `page.jsonl` — not a shared results
file; `evals/results.jsonl` keeps only the rule tests and the probes now (Amendment 5 split them
apart: a test's runs are part of the page that test lives on). A row carries `model`, `effort`,
`pass`, `score` ("terrible"|"ok"|"great", `null` until judged), `cost_usd`, `ms`, `mechanical`,
`note`, keyed by its own `run` name — a later judge-written line with the SAME `run` name merges
onto it (AITest.js's `run()` method does this merge live; `library.mjs`'s `testRuns()` does the
identical merge in node, since that browser class can't be loaded outside one). A run that wrote a
real decision record (`Server/Decide.mjs`, **anywhere in its run dir** — there's no single
canonical filename, so the check scans every `.jsonl` there) gets a second `reasoning` score too —
the thinking, graded separately from the outcome.

**The reference, by consensus:** run a test once each on the strong set (`claude-opus-5-5`,
`claude-sonnet-5`, `openai/gpt-6-sol`, `google/gemini-3.1-pro-preview`), then `--judge` — once 3 of
those 4 runs are in for a test, the judge writes `tests/<id>/reference.md` itself (the key elements
at least 3 agree on, what they disagree on, the agreement rate) before scoring anything against it.
A test where fewer than 3 agree gets no reference, and the file says why instead.

**The routing table:** `--route` reads every test's own `page.jsonl` (the newest line per
model × effort × test wins) and writes [`evals/routing.json`](./evals/routing.json) — for each
test KIND, the cheapest model + effort whose runs score at least "ok", its price as a multiple of
`claude-sonnet-5` (from OpenRouter's public `/v1/models` catalog) and the evidence (which runs,
which scores). It recomputes from scratch every time, so it just keeps catching up as more runs
land. Nothing reads it yet — it's the model-for-task matrix the owner asked for, built to be read
later rather than guessed at.

**Add a test:** make a new folder under `public/framework/ai/tests/`, named the test's own slug.
Give it a `page.jsonl` whose line 1 is `{"class": "/framework/ai/tests/AITest.js", "title", "kind",
"rung", "skills", "prompt": "prompt.md", "criteria", "expected", "judge", "confidence"}`, a
`prompt.md`, and a `fixture/` folder. Then add the slug to `/framework/ai/tests/page.js`'s `SLUGS`
list (its own `child()` override needs it) and its `children:` string (so it shows in the preview
wall). If the fixture is a page, check it really is broken (or really does load clean) headless
once before trusting it. ⚠ Don't name a test-only field `child` — it collides with every Page's own
`child()` method and gets dropped (h1-page uses `new_child` for exactly this reason). A test can
instead carry `from_task: "<ai/… task dir>"` — meaning its prompt and accepted outcome come from a
real, already-landed task rather than a hand-built fixture — but `library.mjs` doesn't read that
field yet; it's documented here for whoever builds that next, not built now.

