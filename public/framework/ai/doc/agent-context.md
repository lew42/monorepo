# Agent context: what each agent is given, and what is logged about it (map, 2026-10-22)

A map, checked against the code on 2026-10-22; nothing changed. Plan to make it visible: [the plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-context/plan.md). Owner direction and the proposals this feeds: [readme-system.md](readme-system.md). The branch `task/readme-roles` (not merged) moves role text from skills to `Servex/agents/roles/<role>.md`; its effect is marked **(branch)**.

## 1. Roles and starts → what each loads

Columns: **CLAUDE.md** = the SDK loads it (`setting_sources` unset). **Chain** = `first_prompt(dir)` from `readme-chain.js`, whole readmes root to `dir`, only for a fresh spawn with `spec.task.dir` or `spec.page` and no `spec.system` (`Agents.spawn`, `directory_of`). **Role text** = `opening(role, prompt)` in `roles.js` inlines `.claude/skills/<skill>/SKILL.md` before the task.

| Start | Model | Role text | CLAUDE.md | Chain | Tools | How injected |
|---|---|---|---|---|---|---|
| `mastermind` | architect, high | skill `servex-mastermind` **(branch: `roles/servex-mastermind.md`)** | yes | yes (its task dir) | whole `servex` MCP (HTTP, names deferred) + `mcp__local__` item/page twins | `Agents.spawn`: `first_prompt(dir)` + `whoami` + `opening()` + the task line |
| `task-mastermind`, `page-mastermind` | manager, medium | skills `sub-mastermind` + `page` **(branch: `roles/task-mastermind.md` + `page`)** | yes | yes | same | same |
| `minion` | scan (Haiku), low | skill `minion` **(branch: `roles/minion.md`)** | yes | only if spawned with `task`/`page`; a bare minion gets a default task dir (since 2026-10-18), so usually yes | same | same |
| `reviewer`, `checker`, `clarity` | manager, medium | skills `review` / `clarity` | yes | no (one-pass roles get no task dir) | same | `opening()` |
| `voter` | manager | skill `research` | yes | if given a task | same | `opening()` |
| `directory-mastermind` (`ask_directory`) | manager, plan | skills `sub-mastermind` + `page`, inlined by `directory.js` `opening(dir)` with the folder's plain files | **no** (`setting_sources: []`; CLAUDE.md and skills arrive as text) | its own, inside `opening(dir)` | `Edit/Write/NotebookEdit` disallowed | `spec.system` is set, so `spawn` sends `prompt` as is |
| `master-assistant` (`Global.js`) | architect, plan | skill `master-assistant` | no | no | `allowed_tools: master_tools`; every other servex tool disallowed | `Global.js` options |
| page-assistant (`Layers.js`) | fast, low | skill `every-prompt` | no | the page's chain (`Layers.js`) | `allowed_tools`: Read, Grep, Glob + a short servex list | `Layers.js` |
| `session-smart` (voice, `Sessions.js`) | manager | brief `session-smart.md`, appended to the claude_code preset | no (no memory, no claude.ai connectors) | no | whole Claude Code preset + servex door | `system` option |
| `voice-assistant`, `session-fast` | fast, low | brief in `system`; the role's skill is **not** inlined (`system` bypasses `opening()`) | no | no | `voice-assistant`: `sdk.tools: []`, the item tool only; `session-fast`: no door | `Sessions.js` spec |
| `fixer` (quick-fix pool) | Sonnet | `Servex/agents/fixer.md` | per spec | no | per spec | `Fixer.js` |
| **VS Code tab** | Fable / Opus, the owner's choice | skills by hand (`/mastermind`); **(branch)** CLAUDE.md says "read your role's readme" | yes, plus `MEMORY.md` (auto memory) | **no** (CLAUDE.md says read it by hand) | `servex` and `site` MCP via `.mcp.json`, all deferred behind ToolSearch | Claude Code itself; hooks in `.claude/settings.json` |
| `claude -p` / CLI minion (`ext/Ask`, older launchers) | per flag | none | yes | no | project MCP; needs `--permission-mode bypassPermissions` or it writes nothing | the process's own cwd |
| Cloud voice (Claude app, `ask_mastermind`) | the app's | `RemoteMCP.INSTRUCTIONS` (MCP server instructions) | no (not on this machine) | no | the one tunnel list at `/mcp/remote` | [cloud-voice-agent.md](/Servex/ext/remote/doc/cloud-voice-agent.md) |

**True of every Servex spawn:** `whoami` (its id and its page `/framework/ai/sessions/<id>/`), the task line ("your task is already open at …"), and `past-work.md` beside the brief. Spawn defaults (model, effort, permission) come from the role row and the tier table (`tiers.js`); a caller's own field wins.

## Where loading is fragile when files move

- **The chain follows the task dir, not the module.** A task agent's `dir` is its dated session folder, so its chain is root, `public/`, `framework/`, `ai/`, `ai/sessions/`, then year/month/day folders that have no readme. The readme of the module it works on is never in the chain unless the spawner names it (the proposal in the plan). Proof: this agent's chain was `readme.md`, `framework/readme.md`, `ai/readme.md`, `ai/sessions/readme.md`: 8,149 tokens, none about `Servex/agents`.
- **`TaskDirs` moved folders in 2026-10 (session folders).** Anything keyed on the path (`spawn_agent` `task.dir`, `directory_of`) follows the new place; a stale `ai/<date>/<slug>` path gives a chain with only the top levels.
- **`SKILLS_DIR` is `.claude/skills`, found from `roles.js`'s own location.** `skill_text()` returns null for a missing file and `opening()` falls back to "Load the X skill", which the model may skip (2 of 518 loaded one on their own, 2026-10-12). **(branch)** the same fallback applies to a missing `roles/<role>.md`.
- **A running Servex keeps old code.** `readme-chain.js` was changed on 2026-10-22 to give whole readmes; agents spawned before `node Servex/sustain.mjs --restart` still got readmes cut at 40 lines ("truncated — read the rest at this path" appeared in this agent's first message).
- **`setting_sources: []` agents** (directory-mastermind, voice, master) get no CLAUDE.md from the SDK, so a rule moved into CLAUDE.md never reaches them; only `opening()` text does.
- **The 12,000-token cap** (`readme-chain.js` `TOKEN_CAP`) never fires today: largest chain 10,420 tokens, median 5,129 ([plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-context/plan.md), script `chain-sizes.mjs` beside it).

## 4. What is logged today about an agent's context

| Event | Logged? | Where, by whom |
|---|---|---|
| Spawn (id, role, model, task dir, parent) | yes | `lifecycle` stream (`Lifecycle.agent_started`); line 1 of the task's `session.jsonl`/`task.jsonl` `{assign:{session_id, agent, title, model, …}}` (`open_task`, `Agents.spawn`) |
| Skills inlined at spawn | yes | `skills` stream `{agent, role, injected:[names], fallback?}` (`Agents.spawn`); not in the session record |
| Skill tool called | tabs only | `ledger.mjs`, hook matcher `Skill` |
| Readme chain given | **no** (not even the paths) | — |
| A readme or file read by the agent | **no** | the raw transcript under `~/.claude/projects` has every `Read` call; nothing in `session.jsonl` |
| Tool calls | the live event only | `emit({type:"tool", name, input})` to the dashboard; the SDK transcript keeps them; `session.jsonl` gets only what the agent logs by hand |
| Cost and tokens | yes | `cache.jsonl`/`index.json` by `AISessionIndex.mjs` |
| Commits, task steps | yes | `ledger.mjs` on Edit/Write/Bash, `post-commit.mjs` via `SERVEX_TASK` |
| Context size over time, share by source (system prompt, CLAUDE.md, readmes, tools, memory) | **no** | the SDK has `SDKContextUsageCategory` (`sdk.d.ts`); nothing records it |

## Can a hook inject text before or after a tool runs?

Yes, by the SDK's own types (`Servex/node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts`): `PreToolUseHookSpecificOutput` has `additionalContext?: string` beside `permissionDecision` and `updatedInput`; the PostToolUse, SessionStart, UserPromptSubmit and Stop outputs have it too. Servex already runs a `PreToolUse` hook in `Agents.refusal()`; it only denies today. Not tested end to end here (plan slice 6 is a 10-minute scratch test). A tab's hooks in `.claude/settings.json` use the same fields.
