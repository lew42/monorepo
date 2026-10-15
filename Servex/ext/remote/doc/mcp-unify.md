# Proposal: one tool registry, each tool marked `local` or `remote`

**Status: a proposal, not built.** Recorded 2026-10-15 from the mastermind's opinion; the owner decides when.

## The problem in plain words

Servex has two separate sets of tools for the same machine.

- **The internal set** (`mcp__servex__*`, about 70 tools, served by `Servex/MCP.js` to agents on this PC). It can spawn, kill, stop and restart things and write to almost any file under `public/`.
- **The tunnel set** ([`RemoteMCP.js`](../RemoteMCP.js), the "lew42-remote" connector the Claude app uses). It has two tools today: `ask_mastermind` and `live_post`. It is reachable from the internet, behind a bearer token.

Two separate sets was the mistake: every new thing the voice app needs (like `live_post`) is hand-written a second time, beside the tool that already does it.

## The proposal

Keep **one registry** of tools. Give every tool a mark, `local` or `remote`. The internal endpoint serves all of them. The tunnel serves **only the `remote` ones**.

```js
tool("page_add", { scope: "remote", ... })     // safe to reach from the internet
tool("spawn_agent", { scope: "local", ... })   // only ever on this PC
```

- A tool with no mark is `local`. Making a tool reachable from the internet is always a deliberate, reviewed one-word change.
- `remote` tools that need narrowing (like `live_post`, which may write only to `/live/`) stay thin wrappers around the one real tool, with the path fixed in the wrapper and never an input.

## Why not one wide-open endpoint

The tunnel is internet-reachable, and the internal set has spawn, kill, restart and arbitrary writes. If the voice connector got the whole set, a leaked bearer token would be control of the machine. The marking keeps the blast radius of that token small: it can read state, ask questions, and leave notes.

Note on wording: the earlier "keys to the castle" worry was about the **Cloudflare token**, not the tunnel's tool set (owner, 2026-10-15). The tool set is a separate question and this proposal is only about that.

## First cut: tools to mark `remote`

Judged by one question: *if a stranger held the token, what is the worst this does?* Reads and narrow writes pass.

**Read-only, mark `remote`:**
`list_agents`, `list_cards`, `read_card`, `card_summary`, `list_pages`, `read_page`, `page_read`, `list_waiting`, `list_claims`, `list_follows`, `list_experts`, `list_servers`, `heartbeat_status`, `task_loop_status`, `system_health`, `session_summary`, `session_line`, `inbox`, `module_inbox`, `readme_modules`, `server_logs`, `job_result`, `dir_log`, `check_page`, `wait_for_agent`, `list_agents`.

**Narrow writes (one card, one note, one line), mark `remote` with the path fixed or checked:**
`page_add`, `page_log`, `page_note`, `page_reply`, `owner_note`, `card_reply`, `card_ask`, `card_set`, `attach_card`, `create_card`, `set_focus`, `add_item`.
For the page tools the wrapper pins the path (today `/live/`); the general `page_add` stays `local`.

**Ask a person-shaped question, mark `remote` once rate-limited:**
`ask_mastermind` (already remote), `ask_manager`, `ask_module`, `ask_directory`, `ask_expert`. Each wakes an agent and costs money, so these need a per-token rate limit first.

## Keep `local`, never over the tunnel

- **Spawn and stop agents:** `spawn_agent`, `stop_agent`, `kill_task`, `interrupt_agent`, `fork_self`, `send_to_agent`, `quick_fix`, `quick_fix_landed`, `start_job`.
- **Servers and the process itself:** `start_server`, `stop_server`, `restart_server`, `restart_servex`, `pause_dispatch`, `resume_dispatch`.
- **Worktrees and landing:** `take_worktree`, `return_worktree`, `close_task`, `snooze_task`, `reprioritise_task`, `clear`, `drop`.
- **Arbitrary writes:** `page_set`, `page_call`, `create_page`, `append_log`, `append_prompt_event`, `amend_bubble`, `log_session`, `audit_session`, `refine_step`, `place`, `file_to_group`, `set_layout`.
- **Identity and bookkeeping that agents use about themselves:** `register_session`, `load_module`, `claim_topic`, `release_topic`, `follow`, `unfollow`.

## How it would be built (when the owner says go)

1. Add `scope` to the tool definition and default it to `local` (`Servex/agents/tools.js` is where tools are collected).
2. `Servex/MCP.js` serves every tool, as today.
3. `RemoteMCP.js` serves `registry.filter(t => t.scope === "remote")` instead of its own hand-written list; `ask_mastermind` becomes one registry entry; `live_post` becomes `page_add` with a pinned path.
4. A test that fails if any tool outside the list above is `remote` (the list in this file is the allowlist).

## What to read next

- [`../RemoteMCP.js`](../RemoteMCP.js): the tunnel endpoint and its two tools
- [`../../../../public/framework/ux/Dictate/doc/voice-bridge.md`](../../../../public/framework/ux/Dictate/doc/voice-bridge.md): the voice path end to end
