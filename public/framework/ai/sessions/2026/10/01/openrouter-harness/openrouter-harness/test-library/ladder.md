# The cheap ladder (2026-10-01, owner-authorised burst)

**The one question:** what is the CHEAPEST model that passes h1-page, fix-label, broken-import
and broken-overflow? (plan-views too, as the fifth rung.)

**Money:** you may spend $10 more on OpenRouter today. Servex's guard knows: a burst file beside
the key adds $10 until 19:00 local. The guard still stops a runaway; when it refuses, stop and report.

## Steps
1. **Compute the list, don't trust anyone's numbers.** Fetch `https://openrouter.ai/api/v1/models`
   (no key needed) and pick exact ids and current prompt/completion prices for these candidates,
   then sort cheapest first:
   - Free: Qwen3 Coder, GPT-OSS 120B, NVIDIA Nemotron 3 (Super or Ultra), Llama 3.3 70B. Free
     ones may log prompts: these test prompts hold nothing personal, so that's acceptable here.
     Note any rate limit you hit.
   - About $0.01–0.30/M: GLM 5.3 Flash, DeepSeek V4 Flash.
   - About $0.2–2/M: Qwen3 Coder (paid), DeepSeek V4 Pro, GPT-6 Luna, Gemini 3.8 Flash.
   - Reference only, no new runs: Gemini 3.1 Pro and our Claude runs already on the test pages.
   Skip a model that doesn't support tools (the `supported_parameters` list); say so in the table.
   Save the list with prices to `ladder-models.json` here.
2. **Run cheapest first, at MEDIUM effort,** through `library.mjs` as before (one run per model
   per rung, rungs 1→4 then plan-views). Climb a family only until a model in it passes every
   simple rung, then stop that family. A model that fails rung 1 and 2 doesn't need rungs 3–4.
3. **Judge** the new runs with the usual judge pass.
4. **Report** on the card, as a table: model · $/1M in · $/1M out · pass per rung · $ per run ·
   price × Sonnet. Above it, one sentence answering the question. Commit in qf-7, reply in one line.

## Also, first (2 minutes)
In `keys-prompts.jsonl`, `lifecycle-reaper-stop` is an agent's message, not the owner's. Swap it
for a real owner prompt with no personal details.
