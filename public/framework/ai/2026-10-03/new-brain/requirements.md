# New brain: which cheap model can do our simple work

## The ask (owner, 2026-10-04 ~00:00, dictated, verbatim excerpts)
> I suggested that we go through each of yesterday's prompts, and frankly today's now ... Honestly, we could potentially use a local LLM if it doesn't make mistakes.

> for any model, we could ask it a handful of like test questions ... questions that we know the answer to and the level of reasoning in that question and answer could vary ... some things could require deep reasoning, meaning like thinking forward several steps ahead

> generating a bunch of questions about our framework that should be self-evident from the documentation could be part of our strategy to enhance our understanding of these AI models and find cheaper ways to run tasks inexpensively

> we're at like 76% ... I don't know if we're ready to rely entirely on open router ... it apparently has a free option. We also potentially have a local host, but we're definitely going to want a little bit smarter model. Like we need to find a new brain.

## Extend what exists (law 6)
- The test ladder: `public/framework/ai/tests/` (AITest.js, rung0-html-to-view, …) and its findings: `ai/2026-10-02/model-weights/` (harness-findings.md).
- The local model: llama-server under Servex (`Servex/ext/local/`, task ai/2026-10-01/local-ai).
- OpenRouter: `Servex/ext/openrouter/`, prices in `ai/system/models/models.json`.

## Want
1. **A question set, three levels, answers known:** (a) facts from our docs (readmes + doc/*.md: "what does Item.set() emit?"), (b) multi-step reasoning (3–5 steps ahead), (c) one real job: refine a raw owner prompt into numbered sentences without dropping anything (use 10 real prompts from /framework/ai/2026/10/02/session-361c4d18/ and /framework/ai/2026/10/03/session-60d9def6/). Graded by script where possible (exact facts, sentence coverage), not by a model's opinion.
2. **Run it** on: the local llama model, 2–3 OpenRouter free models, 2–3 cheap OpenRouter models (e.g. Gemini flash, DeepSeek flash), and Claude Haiku as the bar. Record score, $ per question (real $), and seconds.
3. **One screen:** a table of model × level, and a verdict: which model can take which job (prompt refine, doc questions, simple edits) today.
4. **Then the prompt review itself,** with the winning cheap model: yesterday's and today's owner prompts refined, each ask listed, open vs done. Only if step 3 finds a model that passes level (c).

## Rules
- Spend real $ (OpenRouter) and local, not Claude $: this task runs on an OpenRouter model. Hard cap $4 real.
- No minions. Never the mcp__playwright tools.

Budget: $4

## Queued (2026-10-04 00:05)
OpenRouter refused the spawn: $33.15 spent against a $12.5/week pace. Start when it resets (Monday 00:00 UTC = Sunday 7 pm local), on google/gemini-3.8-flash, not Claude.
