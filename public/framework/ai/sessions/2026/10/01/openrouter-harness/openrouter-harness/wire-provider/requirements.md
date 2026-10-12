# Minion brief: the OpenRouter spike script + the provider field

Load the `minion` skill first. Parent: `task-mastermind-openrouter`. Parent task dir: `public/framework/ai/2026-09-30/openrouter-harness/` — read its `owner-words.md` and `requirements.md` (the owner's words; top priority).

## Why
The owner wants cheaper models and second opinions from other model families. The question: can our Servex agents (Claude Agent SDK `query()`) run a non-Claude model through OpenRouter, by changing env vars only? The OpenRouter key is NOT saved yet. Build everything so it runs the moment `%LOCALAPPDATA%\lew42\servex\openrouter.key` exists, and fails clearly (one line, exit code 2) until then.

## Facts already checked (don't redo)
- OpenRouter docs (Claude Code integration): `ANTHROPIC_BASE_URL=https://openrouter.ai/api`, `ANTHROPIC_AUTH_TOKEN=<key>`, `ANTHROPIC_API_KEY=""` (must be blank, or the CLI authenticates against Anthropic). Also blank `CLAUDE_CODE_OAUTH_TOKEN` so the subscription login can never reach OpenRouter.
- The SDK's `total_cost_usd` is WRONG for a proxied turn (priced off Anthropic's table). Real cost: OpenRouter's `GET https://openrouter.ai/api/v1/generation?id=<id>` (Bearer key) returns `data.total_cost`; and `GET /api/v1/key` returns the key's running `usage` in dollars. Check whether the SDK's assistant `message.id` is the OpenRouter generation id; if it isn't, use the `/key` usage before/after as the per-turn cost.
- Model ids, from the public `GET https://openrouter.ai/api/v1/models` (no key needed): cheap `openai/gpt-6-luna`, cheap `deepseek/deepseek-v4.1-flash`, strong: the newest `google/gemini-*-pro` in that list (verify the id there).
- SDK: `Servex/node_modules/@anthropic-ai/claude-agent-sdk` 0.3.280. Spawn options are built in `Servex/agents/Agents.js` `options()` (~line 708) and `door()` (~line 805, where `env` is assembled).

## Worktree
Work ONLY in `C:/Code/lew42/worktrees/qf-7` (branch `worktree/qf-7`). Commit after every finished piece. Do not merge; the parent merges.

## Deliverables
1. **`Servex/ext/openrouter/spike.mjs`** — `node Servex/ext/openrouter/spike.mjs [model ...]` (default: the three models above). For each model, in a fresh temp dir with one small fixture file, one `query()` turn whose prompt forces Read, Bash and Edit. Record per model: tool calls made (names, ok/error), whether streaming partial messages arrived (`includePartialMessages`), whether the edit landed on disk, then a RESUME turn (`resume: session_id`) asking what it changed — answered correctly or not; real cost per turn (see above); wall time; any error text. Append one JSON line per model to `public/framework/ai/2026-09-30/openrouter-harness/spike.jsonl`, and print a short table. No key → print `no key at <path>` and exit 2. Use `maxTurns` and a timeout so a looping model can't burn money (cap each model at ~$0.25).
2. **The provider field goes live.** `tiers.js`: add an `openrouter` tier example only if useful; the real switch is on the spawn: a spawn spec (and the `spawn_agent` tool in `Servex/agents/tools.js`) accepts `provider: "anthropic" | "openrouter"`; a model id containing `/` (an OpenRouter slug) implies `openrouter`. One small module `Servex/ext/openrouter/provider.js` exports `env_for(provider)` (reads the key; throws `no OpenRouter key at <path>` if missing) and `real_cost(...)`. `Agents.js` merges `env_for()` into the agent's env when the provider is openrouter, keeps `provider` on the registry row so a resume keeps it, and for an openrouter agent sets `cost` from the real cost, not `total_cost_usd`. Claude tiers stay exactly as they are.
3. **Cross-family review hook**: `Server/review.mjs --model <openrouter slug>` passes `provider: "openrouter"` through `spawn_agent` (it may already work via the slash rule; verify, change only what's needed).
4. **A test that runs without the key**: `Servex/ext/openrouter/provider.test.mjs` (plain node, no framework) — env_for with a temp key file gives the four vars right and blanks the two Anthropic ones; with no file it throws the one-line error; the slash rule picks openrouter. Run it; paste the output in your log.
5. **Docs**: update `Servex/ext/openrouter/readme.md` — a "Run the spike" section (one command, where results land) and "Spawn on OpenRouter" (one `spawn_agent` example). Keep it short; no log data in the readme.

## Fence
Write only: `Servex/ext/openrouter/*` (new files + readme), `Servex/agents/Agents.js`, `Servex/agents/tiers.js`, `Servex/agents/tools.js`, `Server/review.mjs`, and your own task dir. Nothing under `public/` except your task dir and `spike.jsonl`'s location. Do not restart Servex. Every process you spawn uses `windowsHide: true`.

## Budget
Small. Read only what you need (the two functions in Agents.js, the spawn_agent tool, review.mjs's spawn call). Land with one line: what works, the test output, the commit hashes.
