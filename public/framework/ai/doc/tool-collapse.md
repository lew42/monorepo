# Tool collapse: 81 Servex tools in every session, a plan to load only what is used

**Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted.** The numbers come from a script you can rerun: [`ToolCollapse.mjs`](../sessions/2026/10/15/voice-20261015/tool-collapse/ToolCollapse.mjs) (data in [`data/`](../sessions/2026/10/15/voice-20261015/tool-collapse/data/tools.json)).

## The concern

> "Context bloat: 75+ tools with descriptions are loaded in every session, and most are never called. Collapse the tools into a few generic ones (ideally the single app(path, delta) tool) plus skills that load per domain. Monitor whether agents reliably choose to use the skills, and note the MCP workflow cost of adding tools (a restart, a reconnect, a new session)."

Owner voice ask `dfa4d219`, logged in [the voice session's task.jsonl](../sessions/2026/10/15/voice-20261015/task.jsonl). The `app(path, delta)` idea is designed in [page-instance](../sessions/2026/10/15/voice-20261015/page-instance/requirements.md).

## The numbers

Read live from the one registry (`GET tools/list` on Servex's `/mcp`, the list every local session gets; the tunnel at `/mcp/remote` serves the same list, see [voice-bridge](../../ux/Dictate/doc/voice-bridge.md)). Tokens are chars ÷ 3.5, a rough guide.

- **81 tools.** Descriptions 23,754 chars, input schemas 34,568 chars; the whole `tools/list` is 62,980 chars, **about 18,000 tokens**.
- **Who pays it.** A Servex-spawned agent loads every schema on every turn: `server()` in `Servex/agents/tools.js` sets `alwaysLoad: true` (without it a small model said the tool was "not available", `Servex/agents/doc/traps.md`). 2,879 agents were spawned since 09-22. A VS Code or CLI tab defers the tools behind `ToolSearch`, so it pays only the names. The tunnel client pays whatever the Claude app does with 81 schemas; unmeasured.
- **Calls, last 14 days** (6,752 transcripts, 7,503 calls): **65 of 81 tools were called, 16 never**. The 16 are 9,667 chars (about 2,800 tokens). Three tools make 50% of calls, 10 make 80%, 29 make 95%.
- **Top calls:** `send_to_agent` 2,032 · `spawn_agent` 1,296 · `refine_step` 981 · `stop_agent` 393 · `card_reply` 334 · `check_page` 262 · `list_agents` 243 · `take_worktree` 210 · `create_card` 204.
- **Biggest to carry:** `spawn_agent` 4,084 chars, `refine_step` 2,526, `append_prompt_event` 2,155, `page_set` 2,065, `create_card` 1,981, `fork_self` 1,821.
- **Never called:** `fork_self`, `quick_fix_landed`, `start_job`, `reprioritise_task`, `ask_expert`, `amend_bubble`, `audit_session`, `interrupt_agent`, `job_result`, `set_layout`, `clear`, `list_pages`, `unfollow`, `list_waiting`, `list_experts`, `set_focus`. "Not called in 14 days" is not "dead"; some are rescue tools.
- **Surprise:** `refine_step` and `append_prompt_event` are 13.5% of all calls but belong to the refine agents only; every other agent carries their 4,700 chars for nothing.
- **Caveat:** the script counts `tool_use` names in the Claude transcripts under `~/.claude/projects`. Tools reached by node code (not by an agent) do not show up there, e.g. `close_task` looks rare (15) because the landing is node-driven.

## The proposal: six tiers (one always loaded, the rest by role or skill)

Sizes below are what [`data/tiers.json`](../sessions/2026/10/15/voice-20261015/tool-collapse/data/tiers.json) measured; the grouping is a proposal, edit the table in the script to try another.

| Tier | Tools | Chars | Calls | Loaded |
|---|---|---|---|---|
| **core** | 20: messaging, cards, `page_*` read/write, `append_log`, `close_task`, worktrees | 17,161 | 53% | always, every role |
| **orchestrate** | 23: `spawn_agent`, `wait_for_agent`, `stop_agent`, queue and `ask_*` | 18,583 | 25% | mastermind and helper roles only |
| **refine** | 6: `refine_step`, `append_prompt_event`, session lines | 7,572 | 13.5% | the refine agents only |
| **coordinate** | 19: claims, follows, modules, groups | 9,661 | 4.7% | behind a skill, or a role that needs it |
| **ops** | 6: servers, `restart_servex` | 2,131 | 3.3% | behind a skill |
| **rare** | 7: `page_call`, `create_page`, `set_layout`... | 4,105 | 0.3% | behind a skill, or one generic tool |

A minion that only reads, edits and lands would load **core alone: about 4,900 tokens instead of 18,000** (-73%), with no new tool and no change in behaviour.

**Where `app(path, delta)` fits:** it replaces the `page_*` family (`page_set`, `page_add`, `page_read`, `page_note`, `page_log`, `page_call`, `page_reply`, `read_page`, about 9,400 chars) and the card writers, once the server-side Page instance exists. That is the later, bigger win; it should not gate the cheap one.

## Do skills load reliably?

- **Servex agents: node injects the skill, so there is nothing to monitor per choice.** `opening()` in `Servex/agents/roles.js` puts each role's `SKILL.md` in the first message; the `skills` log (`{agent, role, injected: [...]}`) shows what each spawn got. See [`Servex/doc/skills.md`](../../../../Servex/doc/skills.md). Moving a tool group behind a skill therefore means: add the group to the role's `skills:` row, and the text arrives with the task. Cost: the skill text is always paid, but one skill is far smaller than its tools' schemas.
- **Self-chosen skills (a VS Code tab, a voice agent) are the risk.** Measured 2026-10-12: told skills load 96.5% (98.0% corrected); skills left to the model's choice (`new-task`, `finish-task`) 66-80%. The `Skill` tool was called 1,208 times in 639 sessions in the last 14 days (same script). A tool that sits behind a self-chosen skill will sometimes simply not be used.
- **How to verify, per stage:** (1) `skills` log: every spawn of the role has the domain skill in `injected`; (2) the script above, rerun: the moved tools' call counts do not fall, and the `Skill` count rises by the same domain; (3) any "tool not available" or "I cannot" line in an agent's final message in a moved domain is a miss; the existing `MissSample.mjs` pattern in `sessions/2026/10/12/session-78fdc37f/skill-reliability/` finds them.

## What each change costs

| Change | What it takes | Who feels it |
|---|---|---|
| Add, rename or remove a tool, or change a schema | The registry is built when Servex boots (`servex.mcp.tool(...)`, `server()`). A **Servex restart** is needed. | Every running agent loses its MCP connection for a few seconds and resumes ("session resumed"); the voice tunnel drops with it. Seen today: this agent's 81 tools vanished and returned on a restart. |
| A VS Code or CLI tab | **Reconnect** (`/mcp`) or **start a new session**; the tab keeps the list it fetched at connect. | You. |
| The claude.ai connector (voice) | Reconnect the connector or start a new call; the app caches the tool list per connection. | The voice agent. |
| A role's tool list or skill row | `roles.js` / `Agents.js`; read at spawn. | Only agents spawned **after** the change; old agents keep the list they started with. |
| A skill edit | Nothing: a file read at spawn. | Next spawn. |

So the cheapest changes are the ones that need no restart: skill text, and role rows if they are read per spawn (check before relying on it). Tool-list changes batch into one restart at a quiet moment, never during a voice call.

## Recommendation (the owner, by voice, 2026-10-16)

**Recommended, not built:** fewer tools, with a generic `call` as step one. One listed tool, `call(tool, args)`, dispatches to any registered handler by name. The handlers stay as they are, and each one's own schema still validates `args` server-side, so this is not the loose `{any}` tool warned against below: a wrong name or bad args gets a clear error naming the right schema. Then the small tools stop being listed, role by role (stage 2 onward). **Why it is still plan-only:** a tool-list change needs a Servex restart, which never happens during a voice call, and nobody has yet measured how well models pick a tool name from skill text instead of from the tool list. **The alternative:** the role-scoped lists in stage 2 come first, with no new dispatcher.

**The end state (the owner, by voice, 2026-10-16, direction only):** `Item.set` is already the universal call: a method key calls the method, a child key walks into that child, and anything else is data. If Servex itself were an `Item`, a tool call and a page delta would be the same `set` on one engine. That supersedes the generic `call` as the end state; `call` stays a possible stepping stone. Related: the server-side page instance design, [core/Page/doc/server-instance.md](../../core/Page/doc/server-instance.md).

## Staged migration (everything keeps working at every stage)

1. **Measure and keep measuring.** Done: the script. Rerun it after each stage and put the numbers next to the stage in this doc.
2. **Scope by role, no behaviour change.** `server(host, ctx, list)` already takes a tool list. Give refine agents `refine`, give minions `core`, mastermind and helper roles `core + orchestrate`; every role keeps today's list until its row is written. One restart. The risk is a role missing a tool it needs: keep a test that every tool named in a role's skill text is in its list.
3. **Hide the 16 never-called tools** behind the `coordinate`/`ops` skills or `ToolSearch` (not delete). Fixes nothing for calls, saves about 2,800 tokens per agent turn.
4. **Group by domain behind skills.** `coordinate`, `ops`, `rare` become skill text that names the tools; the handlers stay registered but are not listed (`tools/list` hides them, `tools/call` still answers), so a tool an old agent knows keeps working.
5. **`app(path, delta)`** when the server-side Page instance exists: the `page_*` tools become thin aliases of it, then stop being listed.
6. **Tunnel check.** The tunnel serves the same registry since `786ea8aad`, so stages 2-5 shrink the local and remote surface together. Give the voice agent its own small list (`ask_mastermind` plus `core`) rather than all 81, since it has no role row yet and asks the mastermind for the rest.

**Do not:** remove a handler before a quarter of data shows zero calls; collapse into one tool whose schema is `{any}` (models call a loose schema badly, and the description is then the whole contract).

## Open, for the owner

- Which role gets which tier (stage 2) is a judgment call; the table above is a first guess from call counts.
- Whether the voice agent keeps all 81 tools or a small list.
