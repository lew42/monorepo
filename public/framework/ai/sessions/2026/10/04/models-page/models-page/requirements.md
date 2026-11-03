# AI → Models tab: every model we use or tested, as one table

## The ask (owner, 2026-10-04, dictated, excerpts)
> I don't know if we have a models tab on the AI page, but we need to, and we need to have a table like this. And I want to see like, you know, total context windows.

> framework/ai/models should be like a database data grid of these models with all this info and definitely make notes in there about token efficiency, token caching ... the nature of how the prompts grow, their read numbers get massive because every new prompt rereads the entire context

> If you give the exact same test, the exact same prompt to two agents, do they use the same number of input and output tokens? ... if we keep an eye on these numbers and compare them across models, maybe we can see ... how this is actually working.

## Want
1. **A Models tab on /framework/ai/** (extend the existing tab set and `ai/system/models/models.json`; law 6: one models list). One row per model: provider (Claude / OpenRouter / Groq / local), context window, $/M in, out, cached in (computed from OpenRouter's `/api/v1/models` by a node script, never typed), our test scores (docs · reasoning · refine, from `ai/sessions/2026/10/04/new-brain/new-brain/eval-results*.json`), seconds, tokens in/out on the same test, and "typical minion $" (median minion this week: 11.3M read of which 99% cached, 43k written). Sortable. Use the DataGrid component if it is on michael/dev by then (task land-two-branches), else a plain table.
2. **Re-run the test once** (`node public/framework/ai/sessions/2026/10/04/new-brain/new-brain/runner.mjs`; it now records tokens_in/out per model) so the token columns are filled; ~$0.10 real.
3. **A short notes section under the table** (plain sentences): why reads are huge (each turn re-sends the whole context, so N turns × context size; 93–99% of agent reads are cached), cache prices per provider, that a fork of a session reuses the cache only on the same model, local file size ≈ VRAM for the weights plus 1–2 GB for context, and that qwen2.5-coder is weak at tool calls (fine for one-shot jobs).
4. Worktree → check_page at 400 and 1920 → merge.mjs. The main site is production.

Budget: $3
Model: Sonnet, ONE agent. Never the mcp__playwright tools.
