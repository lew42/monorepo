# Echo: the prompt-refinement pipeline that already exists

Echo is **built and running**. For every prompt you type in a VS Code Claude chat, it cleans the text, groups it under headings, files what you asked for with a size, and writes all of it onto that session's page. Code: `Servex/agents/Echo.js` (its system prompt is `Servex/agents/echo.md`); the cleaning engine is [ext/Refine](/framework/ext/Refine/) (`engine.js`, `structure.js`). The intended end state is in [vision-2026-10-08.md](/framework/ext/Refine/doc/vision-2026-10-08.md); the gaps are at the bottom.

How dictation, Chat, Refine and the fast assistant connect, and where the chat-window cost comes from: [connection map](/framework/ai/doc/dictation-refine-connection-map-2026-10-08.md).

## What triggers it
1. You submit a prompt in your own VS Code chat. The hook `.claude/hooks/prompt-relay.mjs` adds it as an item on the session's page and posts only its position (not the text) to `POST /log/echo`. `reply-relay.mjs` does the same when the assistant finishes a reply.
2. `Echo.listen()` hears the log line and reads the text back off the page. Servex agents and minions never trigger it, and a loop guard drops Echo's own model calls.
3. One long-lived `echo-<first 8 chars of the session id>` agent exists per chat session (this chat is `echo-87bec773`). Its model is `google/gemini-3.8-flash` through OpenRouter (`SERVEX_ECHO_OR=none` puts it back on Claude).

## What happens to one prompt
- **Mechanical half, in code, no model judgment:** `clean()` rewrites it near-verbatim into numbered sentences (a code diff-check rejects reworded text; misheard names are fixed from a glossary). `structure()` groups the sentences under headings, and code checks every sentence lands exactly once. Both are tried on the local `qwen2.5-coder` first (`SERVEX_ECHO_LOCAL=0` turns that off), then on the default Anthropic model.
- **Judgment half, the Flash agent:** it is shown the clean text and calls the `refine_step` tool three times: `references` (a 3 to 6 word topic plus the `#Page` `@agent` `/path` mentions), `asks_flags` (each ask with a size `quick|small|task|big` and a suggested place: subpage, post, comment, issue), then `done` (one summary sentence). A reply from the assistant is forwarded to it as context only.
- Each step is its own line appended to the page, so a viewer can watch it grow.

## Where the output lives, and how to see it
- **The data:** the session's `page.jsonl`, e.g. [session-87bec773](/framework/ai/2026/10/07/session-87bec773/) (`public/framework/ai/<day started>/session-<id>/`). Each Prompt item gains `sentences`, `sections`, `coverage` (cited, missing, duplicated, confidence per sentence), `topic`, `refs`, `asks`, `flags`, `cost`, `done`.
- **The views:** that page shows the prompt cards (Condensed, Structured, Clean, Raw: `ext/Refine/prompt-card.js`); the AI 2 "Your prompts" card and the `ai/v/3` thread use the same card. The four-column ladder is [ext/Refine](/framework/ext/Refine/). [Try it](/framework/ext/Refine/try/) runs the real `clean()` against any model.
- **Not on the site (blind spot):** the echo agent's own turns and cost are only in Servex's log `%LOCALAPPDATA%/lew42/servex/logs/agent-echo-<id>.jsonl`.

## What it costs, and why it looks high (measured 2026-10-08, from the logs)
There are two bills, and the bigger one is not the Flash agent.

| Part | Measured | Why |
|---|---|---|
| Echo agent `echo-87bec773` | $2.29 over 17 results; about $0.20 per prompt lately | Each prompt is 4 model turns. The agent starts at about 55k tokens of context (the first call shows 54,937 cached tokens) and grows past 100k. OpenRouter bills `input_tokens` in full (the cache fields do not discount), so every turn re-pays the whole context. It was auto-compacted once (170k down to 23k tokens). Replies are forwarded whole (the longest item is 11.9k characters). It also made 15 `Read` and 3 `Grep` calls although only `refine_step` is meant to be allowed; `allowed_tools` does not remove built-in tools, and each extra turn re-sends 100k. |
| Mechanical `clean()` + `structure()` | 80 prompts on this page, $24.72, average $0.31, none under $0.15 | The local-first step never works: `servex.jsonl` holds 1,090 lines like "request (85k tokens) exceeds the available context size (32768)". `askOnce` starts a full Claude Code session, which adds a 55k to 85k token preamble to a one-sentence job, so the local model (32k context) always refuses and the call falls back to the default Anthropic model, twice per prompt. |

The page's `refine_cost_usd` ($5.54) disagrees with the sum of the per-prompt costs ($24.72): `session_cost` lives in memory (resets when Servex restarts) and leaves out the agent's own turns. Proposals for the Servex owner, nothing changed here: (1) call a model directly for `clean()`/`structure()`, with no Claude Code preamble (it fixes both the cost and the local failure); or raise the local server's context to 96k; (2) forward only the first 500 characters of a reply, and restart the echo agent fresh every N prompts; (3) exclude the built-in tools with `disallowedTools`; (4) remove the `TEMP DIAGNOSTIC` `say()` lines in `heard()`; (5) compute `refine_cost_usd` from the page items.

## Against the vision: built, partial, missing
| Vision stage | State |
|---|---|
| Raw (audio, Whisper) | Dictate does this; Echo reads the text of **your VS Code chat only**, not a Dictate or other session ("any prompt in any session" is open). |
| Clean transcript, numbered, near-verbatim | **Built** (`clean()`, glossary, strikes, diff-check). Whole prompt at a time, not per sentence streaming. |
| Refined prompt as interactive cards in the chat | **Partial:** headings and bullets citing sentences exist and show on the session page; they are not request cards inside the chat, and a click opens no sentence in context there. |
| Coverage with confidence per sentence | **Built** (`coverage`: cited, missing, duplicated, confidence). No explicit "observation" class. |
| Handoff to a mastermind | **Missing:** asks carry a `place` and a size, but nothing in `Echo.js` files them; they stay on the session page. |
| Context cards (icon with a few log lines) | **Missing:** mentions are plain pills. |
| Replay over old prompts | **Built** (`agents/echo-replay.mjs`), not run at scale. |
| `Prompt` class with `raw`, `clean`, `refined` | **Missing:** logic is spread over `Echo.js`, `engine.js`, `structure.js` and the card file. |
| Streaming per sentence | **Partial:** one JSONL line per step, so the page grows, but each step waits for the whole prompt. |
