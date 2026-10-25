# Which model for which job

Two parts: **Claude prices and the pick per job** (checked 2026-10-24 against the [official pricing page](https://platform.claude.com/docs/en/about-claude/pricing)), then **the non-Claude evaluation** (OpenRouter, measured 2026-10-12).

## Claude prices (per million tokens, USD)

| Model | Input | Output | Cache write 5m / 1h | Cache read | Batch in / out |
|---|---|---|---|---|---|
| Haiku 5.5, prompt up to 100k | 0.10 | 0.50 | 0.125 / 0.20 | 0.01 | 0.05 / 0.25 |
| **Haiku 5.5, prompt over 100k** | **0.50** | **2.50** | 0.625 / 1.00 | 0.05 | 0.25 / 1.25 |
| Sonnet 5.5 (Sonnet 5 is the same price) | 2 | 10 | 2.50 / 4 | 0.10 | 1 / 5 |
| Opus 5.5 | 4 | 20 | 5 / 8 | 0.20 | 2 / 10 |
| Fable 5.1 | 10 | 50 | 12.50 / 20 | 0.25 | 5 / 25 |

- **Context window:** 1M tokens for all of them; Sonnet, Opus and Fable bill the full 1M at the one rate. **Haiku 5.5 is the only model with a price tier by prompt length**: a request whose prompt is over 100k tokens (cache reads and writes count) pays 5x per token, input and output. Each request is priced alone. (Haiku's 1M window is from the price-comparison sites; the pricing page links its own 1M page without a Haiku line. Servex's `WINDOW_TOKENS` is 1M too: [context.md](context.md).)
- **Thinking tokens are output tokens**: they bill at the output rate, and you pay for the thinking, not only the visible reply (Anthropic's extended-thinking docs; the pricing page itself has no line for it). So a high effort setting costs output price on tokens you never read.
- **Cache:** a cache read is 0.1x the input price (0.05x on Sonnet 5.5 and Opus 5.5, 0.025x on Fable 5.1). A write is 1.25x (5 minutes) or 2x (1 hour). An agent loop re-reads its whole context every turn, so in a long session **cache reads are most of the input bill**.
- **Batch API:** 50% off both ways, asynchronous. We don't use it (no API key, our agents are CLI sessions).
- Other modifiers: US-only inference is 1.1x on everything; fast mode on Opus 5.5 is 2x ($8 / $40).

### Is Haiku over 100k still far cheaper than Sonnet? Yes on fresh tokens, only 2x on cached ones

| One request, 116k-token prompt | Haiku 5.5 (over 100k) | Sonnet 5.5 | Haiku under 100k |
|---|---|---|---|
| fresh input (first read) | $0.058 | $0.232 (4x) | not possible |
| the same context as cache read (each later turn) | $0.0058 | $0.0116 (2x) | at 90k: $0.0009 |
| 2,000 tokens of reply | $0.005 | $0.020 (4x) | $0.001 |

So a 30-turn read-only job holding about 116k: Haiku over 100k is about **$0.17 + first read**, Sonnet about **$0.35 + first read**, and the same job kept under 100k on Haiku about **$0.03**. The owner's belief holds (Haiku past 100k is 2 to 4x cheaper than Sonnet), but the 100k line is a 5x cliff on Haiku itself, which is why [agent-rules.md](agent-rules.md) says to cross it by decision, in the brief's `Budget:`, and never by drift. The measured trial (about 116k tokens of reading, a short answer) cost cents. Cheaper is not the whole question: Haiku has to be good enough for the job (it passed all 27 known-answer tasks below, and misses on judgment-heavy work).

## Where model and effort are set today

1. **`Servex/agents/tiers.js`**: a *tier* becomes a model id, in one line each: `fast` and `scan` are `claude-haiku-5-5`, `manager` and `architect` are `claude-sonnet-5-5` (all Sonnet since 2026-10-07; Opus only for a stated reason). The `session-backend.txt` switch moves every Anthropic tier to OpenRouter.
2. **`Servex/agents/roles.js`**: each role row names its `tier` (so its model) and its `effort`: minion is `scan` / low; task-mastermind, reviewer, clarity are `manager` / medium; every mastermind (`ai-system-mastermind`, `core-page-mastermind`, `mastermind`) is `architect` / high; the voice and card assistants are `fast` / low.
3. **A caller can override both** for one spawn (`spawn_agent` takes `model` and `effort`); a caller's value wins over the row.

## What to run each kind of job on

| Job | Model | Effort | Why |
|---|---|---|---|
| Search, audit, readme or log read, classification, refine, voice | Haiku 5.5 | low | cheapest; the work is reading, thinking tokens add cost and no quality (low beat high on our suite). Stay under 100k, or cross it by a decision |
| A long read where the pieces must be seen together | Haiku 5.5 over 100k | low | still 2 to 4x under Sonnet; state size and cost in `Budget:` |
| Build: code, pages, UI, object-oriented work | Sonnet 5.5 | medium | the default builder; high only for a hard multi-file change |
| Mastermind, architecture, planning, review of a diff | Sonnet 5.5 | high | judgment, but short turns; Opus is 2x Sonnet |
| A decision Sonnet got wrong twice, or a security review | Opus 5.5 | high | state the reason in the brief; Opus 5.5 costs only 2x Sonnet |
| Fable 5.1 | not wired to any tier | | 5x Sonnet; only on a stated reason from the owner |

The rule that decides: **the cheapest model that passes the job's check, with the lowest effort that passes it.** A job that has a known-answer check (the openrouter suite below) is measured, not argued.

## The non-Claude evaluation (OpenRouter, measured 2026-10-12)

Measured 2026-10-12 with the known-answer suite (`Servex/ext/openrouter/evals/quick.mjs`): 27 tasks in our real job shapes, 5 models, 2 thinking levels, 270 calls, **$0.15 in total**. The table with pass rate, seconds and cost per task is on [/framework/ai/models](/framework/ai/models). Re-run it with `node Servex/ext/openrouter/evals/quick.mjs --table`.

## One line per job shape

- **Voice fast and smart assistants:** `openai/gpt-6-luna`, low thinking. It is the cheapest non-Anthropic model that passed 27 of 27 (about $0.00003 per task).
- **Code edit with a test:** luna passed 8 of 8; use Claude Sonnet for real multi-file edits, since the suite only checks small functions.
- **Readme check, card classification:** luna (low). DeepSeek and Gemini at low thinking each missed one card.
- **Transcript clean:** luna (low). Gemini at high thinking failed 2 of 3 (it over-thought), so never raise thinking here.
- **Refine step (asks, tags, ranking):** luna (low); Refine now runs on it.
- **Extraction, summary, reasoning:** every model passed; take the cheapest, luna.
- **Reference:** Claude Haiku 5.5 also passed 27 of 27 at about the same price, so it is the Anthropic fallback. Sonnet 5.5 missed 1-2 tasks and costs about 14x more per task.

Thinking "high" never beat "low" on this suite, and cost up to 20x more (Gemini). Use low.

## The default and the switch (2026-10-12)

**Claude by default; OpenRouter only by the switch** (the owner, 2026-10-12: "while we pay for Claude tokens anyway, keep OpenRouter to a minimum"; task [refine-haiku-live](/framework/ai/sessions/2026/10/12/session-cca8d997/refine-haiku-live/)).

- **Refine** (clean, structure, clarity, notes, live refine) runs on **Claude Haiku**: `RefineCall.model()` in `Servex/ext/refine/RefineCall.js` is the one place it is decided.
- **The voice assistants** run on Claude (`Sessions.claude_model()`).
- **The switch** is one file: `%LOCALAPPDATA%/lew42/servex/session-backend.txt`. Write `openrouter` in it and both move to luna on their next call, no restart; delete it to go back. A Claude refusal (usage limit, logged out) still moves that one voice session to luna by itself.
- Before 2026-10-12 the order was the other way round (luna first, Claude as the fallback); the evaluation above is why luna is the OpenRouter pick.

## Caveats

- Haiku 5.5 is priced at $0.10 / $0.50 per million tokens on OpenRouter; that listing, not an assumption, is used in the table.
- The suite is small and checkable; it ranks models for simple jobs. Judgment-heavy work (architecture, review) stays on Sonnet or Opus.
