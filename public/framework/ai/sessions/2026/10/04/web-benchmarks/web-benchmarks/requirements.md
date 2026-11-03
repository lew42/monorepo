# Web benchmarks: search check, published scores

## The ask (owner, 2026-10-04, dictated, excerpts)
> spawn a cheap ... open router minion ... ask it if it can do web searches. Ask it to do a quick web search just to verify that it works ... I don't know if the Claude SDK allows open router models to use Claude's web search.

> Find simple questions that you can ask AI to test its logic and reasoning ... the test would have to have an absolutely true or false kind of answer ... there's likely many collections of these tests ... is it even worth doing? Because ... hugging face ... they have all these benchmarks ... in our little model database, we want to have the scores ... maybe an overall reasoning capability, zero through a hundred.

> writing down the useful conclusions, I think is very useful.

## Do, in order (stop at any step that fails and say why)
1. **Web access check.** Try each and log which works: (a) your WebSearch tool, (b) WebFetch of `https://html.duckduckgo.com/html/?q=llm+benchmark`, (c) a node call to OpenRouter with the model id plus `:online` (OpenRouter's web plugin; key via `Servex/ext/openrouter/provider.js` `read_key()`), noting its real cost from `usage.cost`.
2. **Published benchmark scores** for these models: gpt-oss-120b, gpt-oss-20b, DeepSeek v4.1 flash, GPT-6 luna, Gemini 3.8 flash, Qwen3 235B, Qwen 2.5 coder 7B, Gemma 4 e4b, Claude Haiku 4.5, Sonnet 5, Opus 5.5. Prefer one aggregate (e.g. an index score 0–100) plus 1–2 named reasoning/coding benchmarks, each with its source URL. Write them to `public/framework/ai/sessions/2026/10/04/web-benchmarks/web-benchmarks/benchmarks.json` (`[{model, benchmark, score, url, date}]`) for the Models tab.
3. **Open test sets with exact answers** (multiple choice, true/false, a number): name 3–5 that are public and small enough to sample 20 items from, with links. Note which are likely memorized by models (old, famous) vs newer.
4. **Verdict, one paragraph:** is running our own battery worth it, given published scores? (Expected: published scores for ranking; our own tests only for OUR jobs, e.g. finished routine tasks reused as test cases.)
Write conclusions only (no thinking logs) as research entries: `node public/framework/ext/Research/` CLI if it fits, else `report.md` here.

Budget: $2 real. ONE agent, no minions. Never the mcp__playwright tools.

## Status (vscode-mastermind, 2026-10-04 12:30)
- Step 1c verified by hand: `openai/gpt-oss-120b:online` answered a live question with 5 cited sources for $0.007. OpenRouter web search works without the Claude SDK.
- Spawn refused until the OpenRouter cost fix lands (/framework/ai/sessions/2026/10/04/openrouter-cost-blind/openrouter-cost-blind/, running). Then spawn this on openai/gpt-oss-120b as a task-mastermind.
