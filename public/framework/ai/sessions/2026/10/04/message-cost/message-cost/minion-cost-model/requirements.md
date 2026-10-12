# Make the "clean" step cheap

## The owner's ask (verbatim, from the parent task)
> Well, I mean, the, the whisper is doing it locally for free. So it's really the clean
> transcription part... ~$0.21 per clean is too much; measure what model/context the clean
> uses and get it to cents (e.g. Haiku or an OpenRouter flash model for clean, no big context).

Full context: `public/framework/ai/sessions/2026/10/04/message-cost/message-cost/requirements.md` (read it first) and
its parent `task.jsonl` (the task mastermind's log — read the last ~10 lines for what's already
been proven live).

## What's actually happening (measured tonight, live, on the real running Servex)

Posted one real line to `POST /api/session/say` on the live server and watched the result:
a `{refined: {...cost_usd: 0.2077}}` line appeared. Same order of cost ($0.21) the owner
quoted for the VS Code/echo path. Two model calls happen per message: `clean()` then
`structure()` (`public/framework/ext/Refine/engine.js` + `structure.js`), each going through
`Server/ask-each.mjs`'s `askOnce()`, which opens a full Claude Agent SDK `query()` with **no
system-prompt override and no `settingSources` override** — so by SDK default it loads this
whole repo's CLAUDE.md + the full `claude_code` preset system prompt for what is really just
"here is one or two sentences, split them and tidy them up." That's almost certainly most of
the $0.21: a huge fixed system-prompt cost on every call, on top of whatever model answers.

Two real paths call this the same expensive way:
- `Servex/agents/Sessions.js`'s `refine(s, line)` (around line 300) — voice sessions.
- `Servex/agents/Echo.js`'s `process()` (around line 285) — VS Code / Dictate text prompts.

## The fix, in order of expected payoff (measure after each step — don't guess which one did it)

1. **Strip the system prompt down to nothing extra.** `askOnce()` in `Server/ask-each.mjs`
   currently passes no `systemPrompt`/`settingSources` to `query()`'s `options`, so the SDK
   defaults kick in (this repo's CLAUDE.md, the full coding-agent preamble). Add an opt-in
   way to call it lean — e.g. an `options.systemPrompt` / `options.settingSources` passthrough
   on `askOnce(text, {..., systemPrompt, settingSources})` that, when given, REPLACES the
   default instead of adding to it. **Keep the existing default behavior for every caller that
   doesn't pass it** — this function is shared (`Server/refine.mjs` and others use it); don't
   change their cost or behavior.
2. **Pass a cheap model.** `claude-haiku-4-5-20251001` is the id used elsewhere in this repo
   (`Servex/agents/demo.mjs`, `Servex/ext/openrouter/evals/*`) — confirm it's accepted as a
   plain Anthropic model id (no slash) by `askOnce`. `clean()`/`structure()` both already accept
   a `model` option and pass it straight to `call()` — Sessions.js's `refine()` and Echo.js's
   `process()` currently call them with no `model`, which is the actual bug: pass
   `model: "claude-haiku-4-5-20251001"` (or whatever you measure is both cheap and correct)
   from both call sites.
   ⚠ Do NOT route this through OpenRouter (`Echo.js`'s `model_for()` / `SERVEX_ECHO_OR`) — the
   live server is currently refusing OpenRouter spawns ("this week's OpenRouter spend is ahead
   of pace"), confirmed live in `servex.jsonl` tonight. Stay on the Anthropic provider.
3. **No big project context.** `askOnce` is called with `cwd` set to the repo root today
   (implicitly, or explicitly — check both call sites). A lean call for "tidy these two
   sentences" needs no `cwd` at all, or a bare temp dir, so the SDK has nothing of this
   project to load. Confirm removing/changing `cwd` doesn't break anything `clean()`/`structure()`
   actually need from it (check their own code — they may not need `cwd` for this call at all,
   only `nodeCall()`'s signature carries it through).

## What "done" means — prove it, don't guess it

Use the EXACT same method already proven tonight: `curl -s -X POST http://127.0.0.1:8090/api/session/new -H "Content-Type: application/json" -d '{"path":"/framework/ai/sessions/2026/10/04/message-cost/message-cost/","host":"monorepo.localhost","fresh":true}'`
then `POST /api/session/say` with a real multi-sentence line, via the live Servex (not a
synthetic unit test) — but do it **against your worktree's own server** (`message-cost.localhost`,
the port `worktree-up` printed), never the main site, until you're ready to prove the final
number — and then once for real against the main site's own Servex (`127.0.0.1:8090`) as the
actual proof this task needs. Read the resulting `cost_usd` straight off the `refined` line.
Do this for the Sessions.js path AND separately confirm Echo.js's own `process()` (a VS Code
prompt, via the `/log/echo` route — or read its code path closely enough to be sure the same
fix applies identically) is under the same target.

**Target: under $0.03 per clean** (the owner's own words: "get it to cents"). Log each attempt
as an `experiment` line in `task.jsonl` (`{"experiment":{"try","measure","result"}}`) — what you
changed, what it cost, in order, so the next reader sees the real path to the number, not just
the final one.

## Fence

- `Servex/agents/Sessions.js` — ONLY the `refine()` method and its own imports/constants.
- `Servex/agents/Echo.js` — ONLY the `process()`/`model_for()`/`call()` methods and their own
  imports/constants.
- `Server/ask-each.mjs` — `askOnce()`, adding opt-in params only, default behavior unchanged.
- `public/framework/ext/Refine/engine.js`, `structure.js` — only if `clean()`/`structure()`
  themselves need a change to forward a new option through to `call()`; don't touch their
  actual tidy-up logic.
- Nothing else. No worktree of your own — you're already in one
  (`C:\Code\lew42\worktrees\message-cost`, branch `worktree/message-cost`); work there, commit
  as you go, do not merge (the parent task mastermind merges once both minions land).

## Load first

The `minion` skill. Then `load_module(["Servex/agents"])` if you haven't already read
Sessions.js/Echo.js in full — the parent task's own investigation (this file's "what's
actually happening" section) already read them once; trust it rather than re-deriving it, but
open the two files yourself before editing.

## Report back

One line to your parent (`task-mastermind-message-cost`) when done: the real measured cost
per clean, before and after, and the two commit(s) you made. If you hit a wall under $0.03 with
Anthropic-only, say so and what the lowest you reached was — don't silently ship something over
target as if it met it.
