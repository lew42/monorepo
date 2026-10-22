# Tools map: every MCP tool Servex and the site serve (2026-10-22)

Read-only map; nothing here is built. The tools come from `tools(agents)` in `Servex/agents/tools.js` plus the files named in the last column; the site tools come from the `site` MCP server. Counts are of the backticked names below. Past work: [ai/doc/tool-collapse.md](/framework/ai/doc/tool-collapse.md) (81 tools = about 18,000 tokens; 65 used in 14 days, 16 never), [owner-2026-10-16-tools.md](owner-2026-10-16-tools.md) (the owner's direction), [item-tool.md](item-tool.md) (the one tool already built).

**How an agent receives them.** A Servex-spawned agent gets the `servex` MCP over HTTP (all tools, names deferred behind ToolSearch) plus `mcp__local__*` in-process (the item and page tools; their HTTP twins are disallowed): `Agents.js` `door()`. A lean voice or page assistant gets none, or a short `allowed_tools` list (`Layers.js`, `Global.js`). A VS Code tab gets the `servex` MCP from `.mcp.json`, deferred. Roles and what each starts with: [ai/doc/agent-context.md](/framework/ai/doc/agent-context.md).

## Servex tools (99 names below; the live list varies with the build)

| Group | Tools | Source |
|---|---|---|
| **Agents** (run and talk to agents) | `spawn_agent` `fork_self` `send_to_agent` `wait_for_agent` `interrupt_agent` `stop_agent` `list_agents` `compact_self` | `agents/tools.js` |
| **Queue and quick fixes** | `quick_fix` `quick_fix_landed` `take_worktree` `return_worktree` `start_job` `job_result` `pause_dispatch` `resume_dispatch` | `tools.js`, `Jobs.js`, `ops.js`, `Worktrees.js` |
| **Tasks** | `close_task` `snooze_task` `kill_task` `reprioritise_task` `task_loop_status` `heartbeat_status` | `tools.js`, `Servex.js` |
| **Logs and sessions** | `log` `log_session` `session_line` `session_summary` `audit_session` `dir_log` `append_log` `append_prompt_event` `refine_step` `register_session` `cloud_voice_log` `dated_create` `dated_query` `move_project` | `tools.js`, `Servex.js`, `ext/refine/` |
| **Items and pages** (the generic writers) | `item` `page_set` `page_add` `page_call` `page_log` `page_read` `page_note` `page_reply` `read_page` `list_pages` `create_page` `place` `set_layout` | `page_tools.js`, `pages.js`, `Layers.js` |
| **Cards and the Inbox** | `create_card` `card_set` `card_reply` `card_ask` `card_summary` `read_card` `list_cards` `list_waiting` `attach_card` `add_item` `amend_bubble` `owner_note` `inbox` `drop` `module_inbox` `updates` `follow` `unfollow` `list_follows` `set_focus` `clear` | `Cards.js`, `Layers.js`, `Follow.js`, `ModuleInbox.js` |
| **Ask a module** | `ask_expert` `list_experts` `load_module` `readme_modules` `ask_module` `ask_manager` `ask_mastermind` `ask_directory` `claim_topic` `release_topic` `list_claims` `file_to_group` `skill` | `Experts.js`, `Layers.js`, `claims.js`, `tools.js` |
| **Servers and health** | `list_servers` `start_server` `stop_server` `restart_server` `server_logs` `check_page` `system_health` `restart_servex` | `Servex.js`, `ops.js` |
| **Files and shell** (for the voice app and remote callers; local agents have Read/Edit/Bash) | `read_file` `write_file` `edit_file` `list_dir` `glob` `shell` | `files.js` |
| **Opt-in** (not in the list unless a role adds it) | `query_sessions` | `tools.js` |

## Site tools (11, the `site` MCP, `.mcp.json`)

| Group | Tools |
|---|---|
| **Tabs** | `pages` `claim` `release` `eval` |
| **Pictures** | `shot` |
| **Research** | `research_agent` `research_log` `research_outline` `research_say` `research_summary` `research_verdict` `research_vote` |

## What past work already did

- **Measured** 2026-10-15: `ToolCollapse.mjs` counted calls from transcripts. Three tools are 50% of calls, ten are 80%. `refine_step` and `append_prompt_event` are 13.5% of calls but only refine agents need them.
- **Built:** the `item` tool (generic over Item classes), `log` (stamped, schema-checked line writer), the in-process twin `mcp__local__*`, `updates` (cloud agents), `ask_mastermind` (the one tool the voice app needs). Scoping by role: `server(host, ctx, list)` takes a list, but no role row passes a short one yet.
- **Not built:** tiers by role (the six-tier table in tool-collapse.md), and the owner's one-tool RPC.

## The compacted set (proposal)

The owner's direction: one `item` tool with a method name and data, the server instantiating the class so the same validation runs as in the browser. Every group above except servers and files is "an Item (card, page, task, session, inbox, claim, follow) and a method on it":

| Always loaded (about 14) | Behind the `item` tool as methods | By role or skill |
|---|---|---|
| `item` `log` `spawn_agent` `send_to_agent` `wait_for_agent` `stop_agent` `list_agents` `take_worktree` `return_worktree` `check_page` `load_module` `readme_modules` `owner_note` `updates` | cards (`create_card`..`amend_bubble`), pages (`page_*`, `place`, `set_layout`), tasks (`close_task`..`reprioritise_task`), inbox and follows, claims, sessions (`session_line`, `session_summary`, `register_session`), dated/projects | servers and health (one `ops` tool: `{verb, args}`), refine (`refine_step`, `append_prompt_event`) for refine agents only, files/shell for remote callers only |

Result: about 14 always-loaded tools plus `item`, where today a Servex agent pays for the whole list. Rough size: tool-collapse.md measured the core tier alone at about 4,900 tokens (-73%); one `item` schema would replace the descriptions of the tools moved behind it (a method list comes back from `{"help":{}}`, as it does now).

**Smallest first slice (about a day):** pass each role a short list to `server()` (core + its tier), no new tool, one Servex restart; then move one group (cards) behind `item`, keep the old names as aliases that call it for one release, count calls from the transcripts before deleting any. The second slice is the item-tool RPC for the rest. Rule from the traps doc: small models report a deferred tool "not available", so a lean role keeps `alwaysLoad`.
