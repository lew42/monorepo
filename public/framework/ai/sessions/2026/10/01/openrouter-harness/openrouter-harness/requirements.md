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
5. **Done: the quality bar before cost (phase 15).** A model must score about as well as
   Sonnet on a task kind before its price counts at all.
6. **Half done: tests that separate models (phase 16).** Each test has a `differentiation`
   score. Still to build: Exploration pages, where questions with no known answer tally what
   many models recommend or avoid.
6a. **Running now: free models first (phase 18).** Every free OpenRouter model that can use
   tools takes the simple tests, with its rate limits (429s, requests per minute) recorded from
   the data. Next, as its own task: a page per model at `ai/models/PROVIDER/MODEL/`, with usage
   totals added by node when a task lands, and a daily check against OpenRouter's own totals.
6b. **Built: keys to success (phase 17).** Models list the keys to about 10 of the
   owner's past prompts. Their consensus is the presumed truth, and each model is scored on
   recall and precision. Only providers that don't train on or log prompts are used.
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

## Full detail, phase by phase
The owner kept adding phases (2 through 17) as the investigation went on. Each one's
instructions still apply — they're just not all above the fold any more. Read them at
[phases.md](phases.md).

<!-- moved to phases.md on 2026-10-01 for clarity (the clarity skill): this file had grown to
247 lines, which buries the current plan under 17 phases of history. Nothing was cut. -->
