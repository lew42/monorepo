# Cache TTL economics + a costed, chunked action plan

Owner (2026-10-08, dictated): Are we configuring the prompt cache — 5-minute or 1-hour? On Sonnet 5.5 the owner reads the pricing as: **5-minute cache write $2.50/M, 1-hour cache write $4/M, cache read ~$0.10–0.20/M** (verify against the official pricing page; a web search is allowed, cite the URL). A cache **read refreshes** the TTL, so a busy agent pays the write once. Worry: a mastermind juggling agents may idle >5 min, the cache goes stale, and it pays a full re-write — maybe 1h would have been cheaper; unclear when. The cache also grows turn by turn as tool calls append.

Then: look at what was done yesterday (2026-10-07/08) and the recommendations the agents produced, and **make a proposal of what should happen next, what each piece costs, chunked so the best and cheapest pieces go first**; re-check pace between chunks and only do more if we stay well under pace.

Budget **$3**, Sonnet 5.5, medium effort. You are a FRESH session on purpose (the parent's context is huge). Batch reads; compute with scripts; chat reply = one sentence.

## Evidence already in hand (verify, don't trust)
- Claude Agent SDK sessions we looked at write **only 1-hour cache** (`cache_creation.ephemeral_1h_input_tokens` > 0, `ephemeral_5m` = 0) — e.g. b719daae (token-accounting): 1.50M 1h-writes vs 57.6M reads, 261 turns; eddd03ac (mastermind): 0.84M writes vs 62.8M reads, 263 turns. Find whether this is the SDK default or a setting we pass, and whether a 5m option is even exposed to us (SDK option / env var such as `ENABLE_PROMPT_CACHING_1H` / `DISABLE_PROMPT_CACHING`; read the installed `@anthropic-ai/claude-agent-sdk` and the claude binary's docs/flags; look at Servex `Agents.js` options).
- Pricing table in `Server/session-cost.mjs` models cache write as 2× input and read as 0.1× input — **check it against real prices** (5m write = 1.25× input, 1h write = 2× input, read = 0.1× input is Anthropic's published structure; confirm for Sonnet 5.5 and fix the table if the 5m/1h split is not modeled). `claude-sonnet-5-5` rate was just added as an ASSUMED copy of sonnet-5 — get the real number.

## Deliverables (numbered)
1. `cache-gaps.mjs` + `cache-gaps.json`: over the real session files (`~/.claude/projects/*/*.jsonl`, case-insensitive folder match — see `Server/session-cost.mjs find_transcript`), for each session compute the **gaps between consecutive turns**, and replay what the bill would have been under (a) all 1h writes (as now) and (b) all 5m writes, where a gap >5 min means the 5m cache expired and the prefix is re-written at the 5m write price (and >1h for the 1h case). Report total $ both ways, by role (mastermind / minion / assistant), and the break-even (how often an agent must idle >5 min for 1h to win).
2. A recommendation: 1h for X, 5m for Y (or one default), what it takes to configure per agent in Servex, and the risk. Name the alternative you rejected.
3. `proposal.md` (one screen): from yesterday's reports/recommendations — `public/framework/ai/2026-10-07/token-accounting/plan.md`, `post-analysis.md`, `prompt-audit/report.md`, `docs-vs-code-audit/report.md`, `mobile-voice-access/findings.md`, `2026-10-08/mastermind-cheap-models/rules.md` — a numbered list of next actions, each with **estimated $ (API-equivalent) and the cheapest model that can do it**, ordered best-value-first, in chunks ("chunk 1: do now, ~$X; chunk 2: only if pace is under N%"). Read the reports' summaries, not every file. Include the usage today (`public/framework/ai/usage.json`) and the pace rule.
4. Anything contingent on the owner → a `Note:` card on the AI board plus one line in proposal.md.

## Rules
Commit your own files with attribution, on a branch/worktree unless it is a task-dir-only write; no loose files. Land with `finish-task`.
