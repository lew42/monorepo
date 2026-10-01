# OpenRouter and the harness: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). **Top priority.** Re-read them before each step.

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
