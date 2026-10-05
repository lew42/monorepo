# Dictate keeps working if Claude cuts off

The switch and the automatic fallback `readme.md` points here from, in full
(`Sessions.js`'s own code comments have the exact mechanics; this is the reader's map of them).

## One setting, no restart needed

`session_backend()` reads a plain text file first — `%LOCALAPPDATA%/lew42/servex/session-backend.txt`
— and only falls back to the env var `SERVEX_SESSION_BACKEND` (unset = `"claude"`, today's
behaviour) when the file doesn't exist.

- `"openrouter"` moves both session-fast and session-smart to `FALLBACK_MODEL`.
- `"local"` moves session-fast (it already runs with no tools) to the local GPU model; smart
  stays on `FALLBACK_MODEL` even under `"local"`, because the smart role needs real tool calls
  (`spawn_agent`, `quick_fix`, `dir_log`) a small local model is weak at.

The FILE matters, not just the env var, because an env var needs a Servex restart to take
effect — exactly what the owner may not be able to do once Claude is cut off. The smart
assistant itself can flip it with its own Bash tool, from the website, no restart:

```
echo openrouter > "%LOCALAPPDATA%\lew42\servex\session-backend.txt"
```

## Automatic fallback, no setting needed

A Claude usage-limit refusal on either agent flips just that one role, for just that one
session, to `FALLBACK_MODEL`:

- `Sessions.js`'s `hire()` registers a fake "sessions" parent the same way `Dispatcher.js`
  does, so every session agent's turn-end or error reaches `woken()` with no polling.
- A match on `USAGE_LIMIT_RE` (an `error:`-kind wake only — a normal reply that happens to
  mention "usage limit" is not a refusal) stops and respawns that one role fresh, with the
  session's own tail as context and the owner's last line re-sent, so the respawned agent
  actually answers instead of starting blank.
- Never resumed: an OpenRouter model can't continue a Claude session id, and `wake()` also
  forces fresh whenever the model a session's `backing` id ran on no longer matches the
  current setting.
- The first refusal also writes `session-backend.txt` itself, so every later ✦ session starts
  on OpenRouter straight away instead of each one needing its own refusal first.

**The flip is one-way on purpose, even past a reset:** anything refused once for usage limits
can be refused again, and only the owner (or the smart assistant, by the same file) knows when
Claude is really back. `USAGE_LIMIT_RE` requires a usage/rate/quota/billing word, never a bare
"exceeded" alone (an unrelated "context length exceeded" must not flip the whole site off
Claude for good) — still a coarse match on purpose: a false fallback costs cents, a missed one
costs the owner a silent session. There is, today, no UI to flip it back besides editing or
deleting that same file; a visible board toggle is a fair follow-up, not built here.

## The default pair, by cost and quality

requirements.md item 3, from the new-brain eval
([`ai/2026-10-03/new-brain/eval-results.json`](/framework/ai/2026-10-03/new-brain/eval-results.json)):
`openai/gpt-6-luna` for BOTH roles.

On the same 18-question set (5 doc facts, 3 reasoning traces, 10 real prompt-refine jobs), it
tied the BEST score on the real job (10/10, level c, same as deepseek-v4.1-flash) while costing
**20x less than Claude Haiku** ($0.0022 vs $0.044 for the whole run) and running **3x faster
than deepseek** (45s vs 140s) — the fastest paid model tested. `claude-haiku-4-5` itself (8/10,
$0.044) and `deepseek/deepseek-v4.1-flash` (10/10, $0.010, slow) were the only other real
contenders. The free local option for the FAST role specifically, `local/qwen2.5-coder` (no
tools, same eval, $0, 23s): 4/5 facts, 3/3 reasoning, but only 8/10 on the real job — worse than
gpt-6-luna's 10/10 at a cost so small ($0.0001/call) it isn't worth trading reply quality for;
`"local"` stays available as a setting for a no-network emergency, not the default.

## Proof

[`ai/2026-10-04/dictate-without-claude/prove.mjs`](/framework/ai/2026-10-04/dictate-without-claude/)
spawns a real session (fast + smart) on `openai/gpt-6-luna` and sends it 3 real sentences,
showing each real reply. It prices each one from its own token counts × OpenRouter's published
rate — real arithmetic, not a guess — but the SDK reported `0` input/output tokens for every
one of these calls, so the $ it shows is a real rate on a $0 token count, not a measured $0 cost
(the same root gap as `usage.cost` going missing, [`openrouter/gaps.md`](../../ext/openrouter/gaps.md)
#8, which this run adds as a second symptom). [`prove-fallback.mjs`](/framework/ai/2026-10-04/dictate-without-claude/)
proves the automatic fallback: a normal reply that mentions "usage limit" does not flip the
switch, a real refusal does, and the freshly respawned agent answers the owner's re-sent line.

## Open, not fixed here

- A refusal that only shows up as a failed `result` (never an `error:` wake) would be missed —
  worth a check against a real refused transcript once one happens live.
- A session saved before this feature shipped has no `backing_model`; flipping the setting by
  hand for one of those would still try to resume a Claude session id under a new model until
  that session's own next natural respawn sets `backing_model` for the first time.
- The live per-call OpenRouter cost gap this task's proof ran into:
  [`openrouter/gaps.md`](../../ext/openrouter/gaps.md) #8.
