# OpenRouter and the harness: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). **Top priority.** Re-read them before each step.

## Current plan, in priority order (updated 2026-10-01 02:30)
The goal: for each kind of task, find the cheapest model that does the job properly.
1. **Done:** our harness runs through OpenRouter, and real costs are recorded. A weekly spend
   pace protects the $50/month (phases 1, 2, 7, 8).
2. **Done:** five tests, each a page at [/framework/ai/tests/](/framework/ai/tests/), all scored
   on Claude (Opus, Sonnet, Haiku). Each test reports how good a test it is (phases 3–5, 9–11).
3. **Done:** the [Models page](/framework/ai/system/models/) ranks value per task kind (phase 8).
4. **Next, tonight after the OpenRouter reset:** run the cheap models on the same tests, the
   probes, the vision test and the web-search cost check (phases 5–7).
5. **Then: the quality bar before cost (phase 15).** A model must score about as well as
   Sonnet on a task kind before its price counts at all.
6. **Then: tests that separate models (phase 16).** Each test gets a `differentiation` score.
   Questions with no known answer become Exploration pages, which tally what many models
   recommend or avoid.
7. **Later:** a ledger of every run (phase 13), tests per system (phase 14), and real-work
   trials. Each test names where its truth comes from (phase 12).

## Why
- Cheaper models for routine work.
- Alternative feedback from other model families, to form a consensus. Anthropic models tend to decide alike.

## Start from what exists
The research is done; read it first and don't redo it: `Servex/ext/openrouter/readme.md` → `snapshot.md`, and the `openrouter` skill. In short:
- **Proxy route:** point `ANTHROPIC_BASE_URL` at OpenRouter, use an OpenRouter key, and the same Claude Agent SDK loop runs a non-Claude model (`Agents.js:514`).
- **`tiers.js`** already has an unread `provider` field: the per-tier switch.
- **Claude itself stays on the subscription.** Paying per token for Claude through a gateway costs more.
- **Open questions:** compaction, resume/fork/cost per turn, real-brief quality, whether cross-family review is worth it.

## Asks
1. **The spike: does the Claude Agent SDK work through OpenRouter today?** Run one real tool-using turn (Read, Bash, Edit) on 2–3 non-Claude models: one cheap, one strong (e.g. a GPT and a Gemini). Measure tool calls, streaming, resume, and cost per turn. Check OpenRouter's current docs for its Anthropic-compatible endpoint first.
2. **If it works:** wire the `provider` field per tier in Servex. A spawn can then say `provider: openrouter, model: <id>`, and the dashboard shows the real cost.
3. **If it doesn't, or it breaks things:** compare building our own small harness against Open Code (which supports OpenRouter natively) or another option. Recommend one, with the alternative (CLAUDE.md law 5), and build the smallest working version.
4. **Consensus review:** one cross-family reviewer on `Server/review.mjs --model`, run on a real recent task, compared with the same-model review.

## The one owner item: the key (priority 100)
The spike needs an OpenRouter API key at `%LOCALAPPDATA%\lew42\servex\openrouter.key` (never in the repo). It isn't there yet, so this is the Inbox item scored 100. **Until the key lands, don't wait:**
- write the spike script so it runs the moment the key exists;
- read the docs;
- evaluate Open Code;
- prepare the provider wiring behind a flag.

## Rules
- Stay WELL under the token allotment (the owner, 2026-09-30). One mastermind with at most 1–2 Sonnet minions, no fan-out. Measure first, then build.
- Plan on a card, then work. Pool worktree for Servex changes, `merge.mjs`, and a Servex restart only through `sustain.mjs --restart`.

## Phase 2 (the owner, 2026-09-30 23:20): which model is good at which task. See owner-words.md, last section
**Do these in order, cheaply. The owner put $50 of OpenRouter credit on the account, and it could easily go in a day if we're careless.**
1. **Spend guard first.** Set a per-key credit limit on OpenRouter, the owner's own setting (e.g. $10/day, if the key settings allow it). Servex records the real `cost` on every proxied reply in one ledger, and stops proxied spawns at a daily cap. Show OpenRouter spend on the dashboard beside the Claude meters.
2. **Rule-following tests with KNOWN answers.** Does a non-Claude model, through our harness:
   - read CLAUDE.md;
   - load the readme chain;
   - call our MCP tools (Servex, site) and in-process node tools;
   - append through append.mjs (not the shell);
   - stay inside its fence?

   Write about 5 small tests that each have one right answer, and run them on 3–5 models (cheap and strong) at their effort or thinking levels. Our instructions are meant to be simple enough for a cheap model to follow, and this tests that claim.
3. **A cost table:** per model and per effort level, $/turn on our real tests.
4. **The model + task matrix.** Categorise our task kinds (naming, brainstorm, a page build, a code fix, a review, writing content). Score each model per kind against known answers or an Opus judge. Lean on whichever model is cheapest and good enough for each kind, especially when resources are low.
5. **Brainstorm, then weighted decisions, with naming as the first example.**
   - **Brainstorm:** a model is given the objective (what the class does, its current name) and proposes as many useful names as it can: class, methods, files, titles.
   - **Rating:** each model, in a FRESH session, rates every candidate with a weight. 1 is the default, below 1 lowers it, above 1 raises it. The weights add up to a ranked list with a confidence.
   - **The owner's example:** `App` / `app`. It's short, it doubles as the class name and the instance name, and it's used everywhere. "Application" is clear but too long for the most-used object. Short where it's used constantly; clear everywhere else.
   - Build on the `decide` skill and `Server/decide.mjs`; don't make a parallel system. Note when a multi-model round gives no clear winner, which is wasted spend, and learn when to skip it.

**Scope:** you own items 1–4. For item 5, build the smallest working brainstorm-and-rate run on one naming question and report the result. The skill text (a `brainstorm` skill, the naming skill's clarity rule) goes to mastermind-servex-9 as a recommendation. Stay WELL under the token allotment.

## Added 2026-09-30 (23:35): probe tasks, and whose fault is it?
**The goal behind all of it:** when usage is the wall and tasks pile up, make the SYSTEM more token-efficient, and move bite-sized work onto cheap OpenRouter models, so progress continues without paywalls or pacing stops.

2b. **Probe tasks** (designed by mastermind-servex-9, run by you).
   - **The task:** small and open-ended, given to a fresh agent in any directory. For example: "make a new page here: a short blog post about X". The prompt can be rough, because the point is to observe the output.
   - **Score each run on a fixed checklist:**
     1. Does it parse?
     2. Does it load in the browser with no console errors (the smoke test)?
     3. Did it follow the prompt?
     4. Did it use the right skills (the Skill hook logs every call)?
     5. Did it open, log and land a task?
     6. Did it link the page from its parent?
   - **Run** across models on OpenRouter, starting tiny so each run costs cents.
   - **Diagnose every failure into one of three:**
     - **(a) The system:** the instructions are unclear. Every model, Claude included, stumbles in the same place. The fix goes to the skills, readmes or CLAUDE.md.
     - **(b) The model:** others pass, this one doesn't. It's a matrix entry, so stop using that model for that kind of task.
     - **(c) Config or feature parity:** OpenRouter or the model lacks something (a tool schema, caching, thinking, a hook). Fix the harness, or note the gap.

   Write each run as one line in a results log, so the model + task matrix (item 4) fills itself in.

## Phase 3 (the owner, 2026-10-01 00:05): the test library. See owner-words.md, last section
- **Don't break the core system for one provider.** The core (masterminds, the fast/smart assistants, Claude minions) stays on Claude exactly as it is. OpenRouter is for NEW minions, especially collaborative ones (3–5 minions that propose, vote and weigh options). Check that the Gemini tool-schema fix didn't change the tool definitions Claude agents see. If it did, keep the Gemini change behind the OpenRouter path only. Document every provider or model gap you find (what fails, why, the source) in `Servex/ext/openrouter/`, so we can weigh it.
- **First priority: does a model use our features properly?** (the rule tests plus the probes). Then sophistication and cost.
- **A test library: a folder of tasks, each with a known good outcome.** Kinds:
  1. **Broken pages:** a small library of deliberately broken pages on the site. "Study this page and say what's wrong with its layout", or "fix it".
  2. **New pages:** "write a new page about X". Check syntax errors, HTML built through JS in house style, object-oriented code, naming, and whether it follows the brief.
  3. **Quick fixes:** a self-evident problem description with one right fix.
  4. **Planning, before code:** "propose the shape; the options and the pros and cons". Some models may plan better and others may code better, so test both.

  Tag each test by skill (CSS, HTML, JS, OOP, layout, system design, naming) and by complexity (the number of requirements).
- **The benchmark by consensus.** If 3–5 strong models (Claude Opus/Sonnet, the best OpenRouter ones) solve a test the same way about 80–90% of the time, that solution is the reference. A run that misses its key elements failed to follow the directions.
- **A judge mastermind** reads each result against the reference and gives a rough score: terrible, OK or great.
- **Record, don't over-architect.** One line per run: test, model, effort, score, cost, time. The model + task matrix and the "cheapest good-enough model per kind" fall out of it. A model at a tenth of the cost can be used much more liberally, even if it's a bit worse.
- **Planning versus decisions:** a planning test's output (shape, options, pros and cons) is what the decision system (ai/2026-09-30/decision-system) documents. Keep the formats the same.

## Phase 4 (the owner, 2026-10-01 00:25): choosing a model is an ongoing decision. See owner-words.md, last section
- **Cost is the easy axis.** The price per token is fixed, and a given prompt has about the same input and output tokens on any model. So compare price MULTIPLIERS (e.g. "a tenth of Sonnet"), not per-run dollars. **Value = good AND cheap.**
- **Tiers:**
  - default to the cheapest model that is good enough for the task kind;
  - use the top models (Fable, Opus) for mission-critical or stuck work and for the very important decisions, not to nitpick every nuance.
- **A routing table:** task kind → model + thinking level, chosen from cost × past performance. It keeps updating as results arrive, so the testing is ONGOING, not a one-off benchmark.
- **Every task can become a test** (selectively, not all of them). A landed task already has the prompt and the accepted outcome. Replay the prompt on other models and score them against what we kept. Bug fixes, pages, even module architecture.
- **Two ways to score a model:**
  - (a) **the outcome:** does the code work and match the reference? This is simpler and faster, and it's the primary score;
  - (b) **the reasoning record:** the decision tree it writes while working (the decision-system format). It costs a little more, but it shows whether the LOGIC is sound even when the code misses, which can redeem a model.

## Phase 5 (the owner, 2026-10-01 00:40): a ladder of concrete tests
- **Rung 1, the smoke test every model should pass:** "make a page here with an H1 that says X". Can it read the skills, write a page.js, use the page skill, and put the H1 in the right place? A 100% pass is GOOD news ("the thing is not completely stupid"). Record it as the floor, then raise the difficulty.
- **Rungs 2+, harder:** for example, "suggest three object-oriented architectures (class signatures, methods, how they talk) for a system with these classes that does X, Y, Z, in OUR style: a jQuery-like object-oriented View library, no virtual DOM, no React-style reactivity". Then "explore different navigation techniques", and so on, until some models fail.
- **Beware bad tests.** A test half the models "pass" by guessing, or one whose author's answer is wrong, proves nothing. Judge a hard test by its consensus, and drop or fix a test where the strong models disagree.
- **Each test checks the SYSTEM and the MODEL together:** could an agent, or a person, complete it using our docs and skills?
- **Minimal context:** give a model only what the test needs, not the whole codebase. That's cheaper, and it tests comprehension.
- **Find the gems:** cheap models, older ones too, that do well, especially at brainstorming. Stress-test how cheap we can go.
- **Care with the $50.** A few quick, minimal runs on a handful of models per rung. No big sweeps.
- **Claude through OpenRouter:** no. Claude stays on the subscription through the SDK's own login (decided in the snapshot). Paying per token for Claude, and for Fable especially, would cost far more. OpenRouter is for non-Claude models.

## Phase 6 (the owner, 2026-10-01 00:50): web search, and who pays for it
Investigation (the first phase of every task) leans on web search, so it must work on OpenRouter minions WITHOUT quietly spending Anthropic tokens. Test each of these and record the answer, with the evidence:
1. **`WebSearch` on a proxied non-Claude minion.** In Claude Code it's an Anthropic server-side tool. Through OpenRouter, does the request fail, get dropped, or get served by OpenRouter's own web search (its `web` plugin or `:online` models, which bill per result)? Does ANY call reach Anthropic?
2. **`WebFetch`.** It fetches locally, then summarises with a small model. Which model does that summary call go to when the base URL is OpenRouter (the small/fast model setting)? If it's routed to Anthropic, that's a leak.
3. **Measure with OpenRouter's exact per-request cost** (the generation stats), not the Claude usage percentages, which are too vague to attribute to one agent. To be sure nothing hits Anthropic, run the test with no Anthropic credentials in that child's environment at all: anything that needs them fails loudly.
4. **The recommendation:** the cheapest reliable search for OpenRouter minions. That could be OpenRouter's web plugin, a search API exposed as our own in-process node tool (Servex tools), or WebFetch on known URLs only. Give the cost per search.
5. **Does a model have web search? The current-events test.** Ask THREE detailed questions about events from the last 24 hours. Getting all three right is astronomically unlikely from memory alone, so it proves a real search. Run it per model, with and without our tool.
6. **If a model has no search, build OUR tool,** one for every model, so search isn't a variable between models. Two kinds of tool:
   - **page → markdown (fetch):** Cloudflare offers [markdown.new](http://markdown.new/), a demo and endpoint, plus the [Browser Run `/markdown` endpoint](https://developers.cloudflare.com/browser-run/quick-actions/markdown-endpoint/) (REST, needs an account token; check the free limits) and [Workers AI `toMarkdown()`](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/). Also send `Accept: text/markdown` to sites behind Cloudflare's "Markdown for Agents". Check rate limits and terms before pointing minions at it.
   - **search (query → results):** a search API (OpenRouter's web plugin; or Brave, Google Programmable Search, Exa or Tavily). Compare the price per search and the free tiers.

   Expose it as an in-process Servex node tool (the house pattern: `Servex/agents/tools.js`, see the in-process-tools decision), not as a new MCP server.
7. **The owner suggested a flood test** (thousands of searches per second, while watching the Claude usage meter for a jump). **Do NOT run it.** It risks being blocked or breaking terms, and the usage meter is too coarse. The no-Anthropic-credentials test (item 3) answers the same question definitively for free. At most, if item 3 is ambiguous: a small burst (about 50 searches) while nothing else is running, with the meter read before and after.

## Phase 7 (the owner, 2026-10-01 01:10): vision for UI review, and a monthly pace
- **The OpenRouter budget pace:** $50/month, so about **$10/week, roughly $1.50/day.** Set the spend guard's daily cap to match, and show the week's spend against $10. The owner may raise it to $100–200/month later, but the job now is to do the best with what we have.
- **Vision tests.** Can each model take a screenshot in a prompt at all? Then: describe the UI accurately, and name its most serious DESIGN FOULS. The canonical foul: text sitting on a background or border change with ZERO padding, which should never happen. Use a few screenshots with KNOWN fouls (planted ones, plus real ones the layout and padding checks already found).
  - The benchmark is Claude: the owner finds its UI judgement good.
  - The aim is to find cheap models that are accurate enough to join a UI-review consensus (a fan-out over a screenshot). A cheap model that sometimes adds an insight nobody else gave is worth running if it costs a fraction of a cent.
- **Configurations multiply** (provider × model × version × thinking level). Sample them; don't sweep. Start with the most promising 4–6 configurations per test.

## Phase 8 (the owner, 2026-10-01 01:20): value = performance ÷ cost, against Claude
- **Every test is benchmarked against a few Anthropic models:** Haiku, Sonnet and Opus, plus Fable on the strong tests. Price the Anthropic runs at Anthropic's LIST prices (the SDK's own cost estimate) even though the owner pays a flat subscription. It's the yardstick for comparing against OpenRouter's real prices.
- **Value = performance ÷ cost.** Rank every configuration (model × thinking level) by value, per task kind. Publish it as ONE page with a chart and a table, under /framework/ai/ (System tab, "Models"), so "which models are best for what?" is answered by a link.
- **Expected tiers:**
  - cheap models (Haiku-class, cheap OpenRouter ones) for search, audits and pattern-finding;
  - higher models for system architecture and the page system, where paying more buys better results.
- **A pace, not a ceiling.** Turn the monthly OpenRouter budget into a WEEKLY pace (monthly ÷ 4), metered like the Claude meters (used% ≤ elapsed%). $50/month is a starting point, not a hard wall. The owner would raise it, even toward $1,000/month, for models that prove accurate, so the investigation is worth some spend. Cost per task matters: at $1–2 per OpenRouter task, 20–100 tasks a day burns any budget, so find the configurations that do the job for cents.
- **Later, after the tests:** try the best-value OpenRouter models on REAL work (the dictation UX, the page system) under a Claude mastermind, which judges the output and asks the minion to clarify anything incoherent.

## Phase 9 (the owner, 2026-10-01 01:30)
- **Thinking levels:** start every model at MEDIUM. If a result is borderline, especially where other models score high, add two sample points at about 25% and 75% of its range. Use min and max only to prove a test DISCRIMINATES (it fails at min and passes at max). Finding the exact threshold isn't important.
- **An `AITest` class** (under /framework/ai/, one instance per test). Each test holds:
  - the prompt (or a path to it);
  - the criteria and the expected result;
  - instructions for the judge;
  - its own CONFIDENCE (how sure we are that the test is good: consensus among strong models raises it).

  Runs are PROGRAMMATIC. Node spawns the minion with the test's prompt FILE, collects the output, and hands it to the judge. No mastermind re-types the prompt.
- **Document how thinking works** on the AI page, with a link: what runs on the provider's server (the model's thinking, inside one API response) and what runs on our machine (the harness's tool loop: the model asks for a tool, the harness runs it and sends back the result).

## Phase 10 (the owner, 2026-10-01 01:45)
- **The default sample:** the NEWEST version of each model family, at MEDIUM thinking. Assume newer is better for now, but note any case where an older version beats it (it happens: Midjourney).
- **Where an `AITest` lives:** as a PAGE. Each test is a folder `ai/tests/<slug>/` whose `page.jsonl` line 1 is `{"class": "/framework/ai/tests/AITest.js", …}`. `PageLog` loads that class before it builds the page (the same way AI 2 cards become `Card`s), and each run is one appended line. Don't use the second system, `core/Item` (its `{type, id, data, items}` tree with `Item.register`). Note for mastermind-servex: two serialize/instantiate systems exist (`PageLog` class lines, and `Item.types`). Recommend one (CLAUDE.md law 6).
- **Write down how thinking spends tokens,** on the AI page:
  - thinking is billed as OUTPUT tokens;
  - in a tool loop, earlier thinking is sent back as input, mostly cached and often trimmed;
  - streaming can be cancelled, but a thought can't be steered mid-way;
  - with interleaved thinking the model thinks between tool calls (e.g. after each web search).

  Verify each point per provider; OpenRouter models may differ.

## Phase 11 (the owner, 2026-10-01 01:50): is the test a good test?
A test's own WEIGHT is its quality. It's shown on the test's page with the models it has run on.
- **Pass rate near 100%:** easy. It only weeds out the worst models. It's still useful as the floor (rung 1), but it weighs little for ranking.
- **Pass rate near 0%:** probably a BROKEN test (a wrong expected answer, an impossible ask). Review the test, not the models.
- **In between:** possibly a real test. But a 50% pass rate can still be a bad test if the criteria are too strict and the "fails" were mostly right.

**How to guard (my proposal; the item-response-theory idea):**
1. **Partial credit:** score each criterion 0–1 and sum them, instead of a single pass/fail. A near-miss scores 0.8, not 0.
2. **Discrimination:** does the score track each model's overall strength? Strong models score high and weak ones low. A test where weak models beat strong ones is suspect.
3. **Near-miss review:** the judge re-reads a sample of FAILED runs and asks "was this actually mostly right?" Too many yeses means the criteria are too strict: loosen them, and lower the test's confidence until it's fixed.

Test weight = discrimination × confidence.

## Phase 12 (the owner, 2026-10-01 01:55): where the truth comes from
An AI judge is only as good as the truth it judges against. Every test names its SOURCE OF TRUTH, strongest first:
1. **Mechanical: code checks it, no judge.** Does it parse? Does the page load with no console errors? Is the H1 there with the right text? Is the page linked from its parent? Did the task log land? Prefer tests built on these.
2. **The owner's kept outcomes.** A landed task the owner accepted is the reference answer for its replay.
3. **Consensus of strong models.** PROVISIONAL truth, with its agreement shown. It's good enough to rank models, not to overrule 1 or 2.
4. **The owner's spot check.** Now and then the owner looks at a few judged runs (via the Inbox, never blocking). Each yes or no calibrates the judge.

A question with NO truth yet (a new design, a name) is not a test. It's an EXPLORATION, run as a brainstorm with weighted ratings (phase 2, item 5). Its winner can later become a test's reference once it's kept.

## Phase 13 (the owner, 2026-10-01 02:00): record every run now, judge it later
- **A RUN LEDGER.** Every agent run Servex makes, Claude or OpenRouter, gets one line: when, agent, role, model + thinking level, task kind, the prompt (a PATH to it, never pasted), the output (a path: the transcript, the files changed), the cost, and the task. Most of this already exists in pieces (the Servex session logs, task.jsonl, the spend ledger). Join them into one queryable index. Don't create a second store.
- **Work blindly now, judge later.** A run with no known answer still counts. Later we can:
  - query "every run of model X" (say 100 of them) and judge them in bulk;
  - replay their prompts on alternative models and compare.
- **Agreement accumulates into truth.** When 5–10 models review the same page, system or process and 3 or more make the same recommendation, that's probably signal, not noise. Record each recommendation as a STATEMENT with its agreement and weight. As more runs agree, its confidence rises, and a high-confidence statement can become a test's reference (phase 12, level 3).
- **Judging is graded:** how thorough and how complete, by a smart judge model. Rarely all-right or all-wrong.

## Phase 14 (the owner, 2026-10-01 02:10): AI tests per SYSTEM
- **Each system (module or path) has its own tools and its own AI tests.** For example, the Page system's "create a page" and "edit a page". Write them ON DEMAND: when agents keep getting something wrong that they should get right, or when we want to find a model that's good at it.
- **Core systems first:** Page, layout, UI and CSS, code (OOP in our style). Systems can carry a weight, so the most important get tests first.
- **Convergence is the reference.** Run a design-type test about 10 times on the best models, and the answers converge on a small handful of likely shapes: method names, APIs. That set, with its weights, is the reference.
- **Name and list tallies:** a suggested name IS its own ID (the string). Each time a model suggests it, its weight goes up, so the most-suggested names rise. Then look at the outliers: a surprising top name, or a good name suggested only 2–3 times. Optionally, every model gives feedback on every name (phase 2, item 5).
- **Thinking level:** for a promising model, re-run the same test at other levels to see whether thinking improves the answers (completeness, correctness). Don't sweep everything.

## Phase 15 (the owner, 2026-10-01 02:20): capability BEFORE cost
"It's better to pay a little more and get it done properly than pay a tenth the cost and get a tenth the result."
- **A QUALITY BAR comes first.** For each task kind, a model must clear the bar (e.g. it scores at least as well as Sonnet on that kind's tests, or within a small margin) before its price is considered at all. Value (performance ÷ cost) ranks ONLY the models that pass the bar.
- A cheap model below the bar isn't "good value". It's out for that task kind, except as an extra voice in a brainstorm or vote, where a sometimes-useful idea is still worth a fraction of a cent.
- Count the hidden cost of a weak result: the re-do, the review, and the time a wrong answer burns.

## Phase 16 (the owner, 2026-10-01 02:25): differentiation, and recording strong signals. The recording format is DECIDED below.
- **`differentiation` is a named property of every AITest:** how well its scores separate models (the spread of scores across models, adjusted for discrimination per phase 11). It's the strongest reason to run a test on MORE models. A mastermind may raise a test's weight when its differentiation is high. The test's weight = differentiation × confidence.
- **Strong signals are what we're looking for:**
  - an item that many models recommend independently (a name, an option, a strategy);
  - an item that many models say to AVOID.

  Both are strong.
- **How they're recorded (decided; alternative below):**
  - an exploration question is a PAGE: `ai/explore/SLUG/page.jsonl`, whose line 1 is a class line pointing to an `Exploration` class (shown with the decision UI);
  - each model's answer is appended as lines: `{"suggest": {item, by: model, rank, weight}}` for "recommend X", and `{"avoid": {item, by: model, why}}` for "steer clear of Y";
  - an item IS its string ID (normalised: trimmed, case-folded for matching, original spelling kept), so repeats tally automatically;
  - the page shows a ranked list: count, mean weight and spread, with strong-recommend and strong-avoid at the top and bottom.
- **Alternative (rejected):** one shared signals.jsonl for every question. It's simpler to append, but harder to browse, and it breaks "everything is a page".
- The first exploration is the naming question from phase 2, item 5.

## Phase 17 (the owner, 2026-10-01 02:35): keys to success, the benchmark corpus we already have
- **Every prompt has KEYS TO SUCCESS:** the primary statements, to-dos, questions and decisions that must happen for the answer to succeed, whether or not the answer is known yet.
- **The corpus:** the owner's own past prompts, verbatim, in `.claude/prompts/*.jsonl` (author "owner"), plus each task's `owner-words.md`.
- **The test:** a model gets ONE prompt (plus minimal context) and lists its keys. Then:
  1. many models do the same prompt;
  2. a judge MERGES keys that mean the same thing under different wording (similar ideas named differently reinforce each other);
  3. the merged keys carry consensus weights. That's the presumed-true key set, rising with every model that agrees;
  4. each model is scored against it: recall (did it find the heavy keys?) and precision (did it invent keys nobody else saw?).
- **Start with about 10 prompts** of mixed length, on the newest model of each family at medium, plus Sonnet and Opus as the yardstick.
- **A free bonus:** the merged keys for a prompt are a checklist of what the owner asked for. Diff them against `ai/asks.jsonl` to catch asks that never got routed ("nothing in limbo").
- **Privacy:** the owner's prompts go to third-party providers. In the owner's OpenRouter account, set "no training / no prompt logging" (Settings → Privacy), and route only to providers that honour it. Until that's confirmed, use prompts that hold no personal details.
