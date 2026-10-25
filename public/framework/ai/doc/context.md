# Context: what an agent knows right now, what it costs, and how to work around its limits

An agent only knows what is in its **context window**: the system prompt, every message so far, every file it read, every tool result. Nothing else. This page is the plain explanation. The two pages that go deeper: [compaction.md](compaction.md) (when Servex summarizes a context and what that costs) and [context-drift.md](context-drift.md) (why a long session forgets its role). What survives outside a context: [context-loss.md](context-loss.md).

## What a context window is, and how big

The window is the most text (counted in **tokens**, about three quarters of a word each) a model can read at once, input and its own reply together. When it is full the oldest part is dropped or summarized. Every turn re-reads the whole window, so a bigger context is a slower and dearer turn, even when most of it is cached ([tokens.md](tokens/tokens.md)).

| Model | Window | Where it is recorded |
|---|---|---|
| Claude Opus, Sonnet, Haiku (the Servex tiers: `claude-opus-5-5`, `claude-sonnet-5`, `claude-haiku-4-5`) | 200,000 standard in the catalog; Servex plans its reminders on **1,000,000** because its masterminds run past 200k before the 400k ceiling | `ai/system/models/models.json` `catalog[].context`; `WINDOW_TOKENS` in `Servex/agents/Agents.js` (override `SERVEX_WINDOW_TOKENS`) |
| OpenRouter scan models (Qwen flash, DeepSeek flash, Gemini flash) | 1,000,000 or more, very cheap | the same catalog |
| Local models (Qwen 2.5 coder, Qwen 3 8B, Gemma) | 8k to 37k: no tool catalog fits ([context-window.md](tokens/context-window.md), §4) | the same catalog |

If the real window is smaller than the number Servex assumes, the percentages in a nudge are low by that factor. The catalog number is the model's; the Servex number is a planning choice. Check them against each other when a model changes.

## Reading a session's context live

Yes. Servex records `context` on every agent: the tokens the last turn had in its window (input plus cache reads plus cache writes plus output; `Agent.live_context()`). It sets it from the SDK's usage on each turn and from `post_tokens` after a compaction. Read it with `list_agents` (one row per agent, `context` among the fields) or on the roles and sessions pages. A VS Code tab is not a Servex agent, so its size is only visible in its own status line.

## Auto-compaction

Servex compacts for you in three places, all described in [compaction.md](compaction.md): before an agent sleeps (over 100k), when an idle agent is nudged and chooses to (a mastermind at 150k), and at a safety ceiling (400k tokens or 500 MB). The Claude CLI has its own auto-compact near the full window, which Servex never turns off. A compaction is a turn that replaces the conversation with a summary of about 10 to 20k tokens.

## Context dependency: a fresh agent knows only what was written down

Whatever the last agent had read is gone when it is replaced: a new session, a renewed mastermind, a minion that ends, a compaction. The only things that carry over are the system prompt and CLAUDE.md, the files in the repo, and the logs. So:

- A decision that is only in chat does not exist for the next agent. Write it where it belongs (the module's readme or `doc/`) and link the prompt it came from (CLAUDE.md, "Context must not die in sessions").
- A brief must be complete: the paths to read, the goal, the budget. The agent is not "the same one, with a refresher".
- A handover is computed from the files (`task.jsonl`, the session page), never remembered ([context-loss.md](context-loss.md)).

## Context pollution: the second pass follows the first

An agent that reads a previous pass's findings before it looks for itself tends to agree with them. It spends its effort checking what it was handed, not searching, and any mistake in the first pass is now two passes' worth of confidence. This hits reviewers, auditors and "second opinion" agents hardest. So:

- A pass that needs to be independent never reads the other pass's output. It gets the question and the sources, nothing else.
- When a later pass must read earlier findings (a merge, a ranking), say so in its role: it **judges** findings, it does not **find** them.
- Agreement between passes that never saw each other is real evidence. Agreement after one read the other is not. [parallel-haiku.md](parallel-haiku.md) is the idea built on this.

## Working in context-independent phases

Break a big job into phases where each phase starts from a clean context and ends by writing a file the next phase reads:

1. **Phase N reads sources, writes `findings`** (a markdown or JSONL file beside the task).
2. **Phase N+1 reads only that file** (plus whatever new source it needs), and writes its own.
3. The agent between phases is replaceable. Nothing is lost if one dies, runs out of context, or is compacted.

This is what a **Process** is: a task template whose steps node runs in order, each step handed the files the one before wrote ([core/Task/doc/process.md](/framework/core/Task/doc/process.md)). It is also why long reads go to a cheap agent (Haiku, [agent-rules.md](agent-rules.md)): the reader is disposable and its only output is the file.

## Rules of thumb

- Keep a mastermind's context short by delegating reads; it decides, a child reads.
- Do not compact a mastermind in the middle of work; compact at an idle moment or when it sleeps.
- A prompt that must be followed to the end belongs in the system prompt (the role text), not the first message.
- Count with a script, not by feel: `list_agents` for `context`, the Servex `compact` log lines for `before` and `after`.
