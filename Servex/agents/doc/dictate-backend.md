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

A Claude usage-limit refusal **or an auth failure** (an expired login, an invalid key, a 401 —
[auth-fallback, 2026-10-05](/framework/ai/sessions/2026/10/05/auth-fallback/auth-fallback/): the owner, "the smart
mastermind kept saying failure to log in... we don't want roadblocks") on either agent flips
just that one role, for just that one session, to `FALLBACK_MODEL`:

- `Sessions.js`'s `hire()` registers a fake "sessions" parent the same way `Dispatcher.js`
  does, so every session agent's turn-end or error reaches `woken()` with no polling.
- A match on the usage/rate/quota/billing wording (`USAGE_LIMIT_RE`/`USAGE_LIMIT_WORDS`) OR the
  login/auth wording (`AUTH_FAIL_RE`/`AUTH_FAIL_WORDS`: invalid key, unauthorized, 401, oauth
  token, "please run /login", "logged out") — either a rare `error:`-kind wake, or (the
  common case: a session agent is never `one_shot`, so a refused turn usually wakes as an
  ordinary `done:`) the live agent's own `last_error` — stops and respawns that one role fresh,
  with the session's own tail as context and the owner's last line re-sent, so the respawned
  agent actually answers instead of starting blank. A normal reply that just mentions "usage
  limit" or "logged out" in conversation is not a refusal and never matches.
- An auth failure also posts ONE card to the AI inbox ("Claude logged out — answering on
  OpenRouter", with the fix: re-run `claude /login`) — once per Servex run, not once per call,
  since several sessions can fail in the same burst once Claude's login is actually down.
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
([`ai/sessions/2026/10/04/new-brain/new-brain/eval-results.json`](/framework/ai/sessions/2026/10/04/new-brain/new-brain/eval-results.json)):
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

[`ai/sessions/2026/10/04/dictate-without-claude/dictate-without-claude/prove.mjs`](/framework/ai/sessions/2026/10/04/dictate-without-claude/dictate-without-claude/)
spawns a real session (fast + smart) on `openai/gpt-6-luna` and sends it 3 real sentences,
showing each real reply with its real $ — read from the turn's own `result.modelUsage` (the
streamed message's `usage` is a `0`/`0` artifact, not the real count;
[`openrouter/gaps.md`](../../ext/openrouter/gaps.md) #8), diffed per turn and priced against
OpenRouter's published rate. Cross-checked in the same run against a live key-level balance
diff — see `prove-results.txt` for the committed run's exact numbers (the key-level reading
can legitimately land anywhere from $0 up, per gaps.md #8).
[`prove-fallback.mjs`](/framework/ai/sessions/2026/10/04/dictate-without-claude/dictate-without-claude/) proves the automatic
fallback: a normal reply that mentions "usage limit" does not flip the switch, a real refusal
does, and the freshly respawned agent answers the owner's re-sent line.
[`prove-auth-fallback.mjs`](/framework/ai/sessions/2026/10/05/auth-fallback/auth-fallback/) proves the same for a
stubbed auth failure, plus that only ONE card gets posted across a run with two failures.

## Open, not fixed here

- The match (`usage/rate/quota/billing` wording) also fires on a short, transient 429 that has
  nothing to do with a real cutoff, and the flip is one-way — accepted on purpose (readme.md:
  a false fallback costs cents, a missed one costs the owner a silent session), but there is
  still no UI to flip it back besides editing or deleting `session-backend.txt` by hand, and
  nothing clears it automatically once Claude's own weekly reset passes.
- The `"local"` setting (fast on `local/qwen2.5-coder`) is untested by either proof — neither
  spawns it, and nothing here checks that the local model server is actually running.
- A session saved before this feature shipped has no `backing_model`; flipping the setting by
  hand for one of those would still try to resume a Claude session id under a new model until
  that session's own next natural respawn sets `backing_model` for the first time.
- The live per-call OpenRouter cost gap this task's proof ran into:
  [`openrouter/gaps.md`](../../ext/openrouter/gaps.md) #8.

## Lean smart assistant, quiet fast assistant (2026-10-14, dictate-next-4)

- The smart assistant starts with `setting_sources: []` and no claude.ai connectors, so it no longer loads CLAUDE.md, skills or memory: `session-smart.md` is the only rule it follows. Still true on the Opus 5.5 seat (2026-10-25): "mastermind permissions" are tools and the Servex door, not CLAUDE.md; the brief carries the owner's rules a mastermind needs. Deliberate: context 68k to 44k tokens, first reply 46 s to 6.8 s. Do not add a skill it cannot load; put the rule in the brief.
- The fast assistant is dropped in code (`FAST_NAMED` in `Sessions.js`) unless the sentence it heard starts with "fast" or says "fast assistant" (not "fast assistant's"). Proof: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-next-4/replay.mjs`.
Caveats (review): no `site` tools for the smart assistant (project .mcp.json dropped); a smart agent revived after a Servex restart loses the spec `env`, so it starts with connectors again (bigger, not broken); `s.fast_heard` is one slot per session. Left: add a "Fast assistant, …" sentence to the replay.
