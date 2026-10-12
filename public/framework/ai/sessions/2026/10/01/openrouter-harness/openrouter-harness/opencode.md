# Open Code: the fallback if the SDK proxy fails

**Recommendation: keep the Claude Agent SDK proxy as plan A. Open Code is plan B, not our own harness.**
The alternative, building our own small loop, is plan C: only for the pieces both A and B get wrong.

## Why this order

| | SDK proxy (A) | Open Code (B) | Our own loop (C) |
|---|---|---|---|
| Code we change | env vars + one `provider` field | a second backend in `Agents.js` | everything under `query()` |
| Sessions, resume, fork | free (today's code) | yes: `POST /session`, `/session/:id/fork` | build it |
| Live events | free | yes: `GET /event` (server-sent events) | build it |
| MCP tools (our 50+ Servex tools) | free | yes: `POST /mcp` adds a server | build it |
| Compaction | free | yes, automatic (from memory: verify) | build a summarizer |
| Reads CLAUDE.md | yes | reads AGENTS.md, CLAUDE.md as fallback (from memory: verify) | build it |
| Tuned for non-Claude models | **no**: Claude Code's prompts and tool shapes | **yes**: built for many providers | yes |
| OpenRouter | through the "Anthropic skin" | native provider | native |

## What decides it
The spike (`spike.jsonl` beside this file) answers one thing: do GPT, Gemini and DeepSeek finish a Read + Bash + Edit turn, and resume it, through the SDK proxy.
- **All pass** → A. Nothing new to build.
- **Tool calls break or loop** → B. `@opencode-ai/sdk` (`createOpencode()` starts the server and a client), driven from a second `Agent` class beside the SDK one, same events out.
- OpenRouter's own docs warn that Claude Code "may not work correctly with other providers", so B is a real possibility, not a formality.

## Sources
- OpenRouter, Claude Code integration guide (checked 2026-09-30): `ANTHROPIC_BASE_URL=https://openrouter.ai/api`, `ANTHROPIC_AUTH_TOKEN`, blank `ANTHROPIC_API_KEY`.
- opencode.ai/docs/server and /docs/sdk (checked 2026-09-30): the endpoints above.
- Earlier research: `Servex/ext/openrouter/snapshot.md`, node `ah7hc` (Open Code accepted as the second arm).
