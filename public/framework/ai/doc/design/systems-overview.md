# AI Systems Architecture & Data Flow

This document details the architecture, persistence layers, data flow, MCP tool infrastructure, and session logging for the Lew42 AI subsystem (`public/framework/ai/`, `public/framework/ai2/`, and `Servex/`).

---

## 1. High-Level Architecture & Servex Core

Servex is the supervisor and integration backbone of the machine. It operates as an always-on Node process (`Servex/Servex.js`) binding loopback (`127.0.0.1:8090` for dashboard/API/MCP, port 80 via `gate.mjs` for reverse proxying to dev servers).

```
 ┌────────────────────────────────────────────────────────┐
 │                      Browser UI                        │
 │   /framework/ai/  /framework/ai2/  (AIRail, Chat, Cards)│
 └─────────────┬──────────────────────────▲───────────────┘
               │ HTTP POST                │ SSE (/api/stream)
               ▼                          │
 ┌────────────────────────────────────────┴───────────────┐
 │                        Servex                          │
 │ ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐ │
 │ │  Log.js     │ │  Stream.js   │ │  Agents.js (SDK)  │ │
 │ │  (1-writer) │ │  (SSE demux) │ │  live / dormant   │ │
 │ └──────┬──────┘ └──────────────┘ └─────────┬─────────┘ │
 │        │                                   │           │
 │ ┌──────┴──────┐ ┌──────────────┐ ┌─────────┴─────────┐ │
 │ │  Cards.js   │ │ Dispatcher.js│ │ Heartbeat/TaskLoop│ │
 │ └─────────────┘ └──────────────┘ └───────────────────┘ │
 └────────┬───────────────────────────────────┬───────────┘
          │ Disk                              │ Disk
          ▼                                   ▼
 public/framework/ai/                 %LOCALAPPDATA%/lew42/servex/
  ├── cards.jsonl (static index)       ├── logs/prompts.jsonl
  └── 2026/MM/DD/<card>/page.jsonl     ├── logs/agent-<id>.jsonl
                                       └── registry.json
```

### Core Subsystems
1. **Single Log Writer (`Servex/Log.js`)**:
   - Manages append-only event logs in `%LOCALAPPDATA%/lew42/servex/logs/<name>.jsonl`.
   - Guaranteed single-writer serialisation preventing torn lines between concurrent processes.
2. **Server-Sent Events (`Servex/Stream.js`)**:
   - Streams live appends over `GET /api/stream` (CORS enabled for loopback).
   - Multiplexes `prompts` and `cards/<slug>` events to connected browser tabs.
3. **Agent Host (`Servex/agents/Agents.js`)**:
   - Supervises in-memory Claude Agent SDK sessions (`Agents.Agent`).
   - Supports states: `working`, `idle`, `dormant` (process exits after idle timeout, resumes in place without losing context), and `stopped`.
4. **Admission & Spend Gate (`Monitor.js`, `Budget.js`, `Agents.gate()`)**:
   - Protects system resources (CPU, RAM, GPU, live agent cap).
   - Results-gated spend policy: starts agents with \$2, unlocks \$3 per verified result (commits, landed steps, page edits, spawned minions).

---

## 2. Persistence & Data Flow Audit

### A. How Cards Flow and Persist
A card is a directory containing an append-only log:
`public/framework/ai/<YYYY>/<MM>/<DD>/<slug>/page.jsonl`.

1. **Card Ingestion**:
   - The owner dictates or types in the composer (`public/framework/ai/cards/compose.js` / `ux/Dictate`).
   - Browser POSTs to `http://servex.localhost/log/prompts` (or `/card/append` when scoped to an open card).
   - `Log.js` commits the prompt to `%LOCALAPPDATA%/lew42/servex/logs/prompts.jsonl` and emits an `append` event.
   - `Assistant.js` (holding the warm `assistant-fast` Claude session) hears the prompt. Once speech pauses, it classifies the utterance and calls `append_prompt_event` or `create_card`.
2. **Directory & File Creation (`Servex/cards/Cards.js`)**:
   - `Cards.create()` resolves or creates the date hierarchy (`public/framework/ai/YYYY/MM/DD/`).
   - Claims a unique slug with atomic `mkdir` (`<slug>`, `<slug>-2`).
   - Line 1 of `page.jsonl` writes the card metadata:
     `{"class": "/framework/ai/cards/card.js", "title": "...", "type": "...", "id": "...", "created": "...", "by": "...", "tags": [...]}`.
   - The parent date folder's `page.jsonl` appends `{"file": "<slug>/page.jsonl"}`.
3. **Static Index Regeneration (`cards.jsonl`)**:
   - Any write to any card triggers `Cards.index_soon()` (debounced by 1,000 ms).
   - Generates a compiled summary index at `public/framework/ai/cards.jsonl`.
   - Browser clients (`AIRail`) fetch this static index directly—allowing the dashboard to display ~400 cards without walking directory trees.

### B. The Inbox System (Scoring, Priorities, Filters)
Implemented across `public/framework/ai/rail/inbox.js`, `needs-rule.js`, and `core/Page/ext/Inbox/Rail.js`.

- **Score Calculation (`importance(item)` in `needs-rule.js`)**:
  - Scores range from `0` to `100`.
  - **Threshold**: The default Inbox rail enforces `HOT = 90` (`Rail.FLOOR = 90`). Cards `< 90` are filtered out of the Inbox rail (visible on the **Log** tab via `?min=0`).
  
| Band | Priority Score | Criteria | Decay Behavior |
| :--- | :--- | :--- | :--- |
| **Blocker** | `97 – 100` | Contains `is_blocker()` or `BLOCKER_WORDS` (`key`, `login`, `password`, `credential`, `pay`, `payment`, `delete`, `force`, `destroy`, `wipe`). | **Never decays** while open. |
| **Blocked (Live)** | `90 – 96` | Open Question/Decision with an active/live waiting agent (`from_live === true`). | **Never decays**; rises as wait time increases. |
| **Fresh** | `90 – 99` | Newly touched card within `FRESH_HOURS` (24h). Raw prompts fresh for 1h. | Fades linearly down to resting score over 24h. |
| **Plain Ask** | `40 – 55` | Open Question/Decision with no active agent waiting. | Resting band (hidden from 90+ Inbox). |
| **Stalled Ask** | `15 – 35` | Silent task owner; heartbeat handles recovery. | Increases slowly with silence and cost. |
| **Decided / FYI**| `10 – 30` | Decisions already made, notes, landed tasks without asks. | Resting band. |

- **Rail Filters**:
  - `?min=90`: Default Inbox rail (only pressing/fresh items).
  - `?min=0`: Log rail (shows everything).
  - `?review=1`: "Needs review" filter (only cards matching `needs_ids`).
  - Search and Archived toggles temporarily bypass the `90` score floor.

### C. System Triggers Matrix

| Trigger Origin | Mechanism | Target / Consumer | Action Taken |
| :--- | :--- | :--- | :--- |
| **Voice / Text Dictation** | POST `/log/prompts` | `Assistant.js` | Fast assistant processes utterance; generates card/tasks. |
| **Task Queued** | `prompts.jsonl` append `{type: "task", state: "queued"}` | `Dispatcher.js` | Gated by `Monitor.js`; spawns `mastermind` agent. |
| **Card Question Answered** | Line with `chose` or `answer` appended | `Cards.js` `wake()` | Wakes asking agent (`place.from`) via `Agents.send()` or raises spend gate. |
| **Heartbeat Interval (60s)** | `Heartbeat.js` tick | Silent task agents | Pings silent agents (>5m); auto-revives dead agents. |
| **Task Loop Interval** | `TaskLoop.js` tick | Stalled tasks | Escalates stalled tasks to their card after quiet intervals. |
| **File Modification** | Node `fs.watch` (`Follow.js`) | Subscribed agents | Pushes change notifications directly into agent message queues. |
| **Card Write** | `Cards.js` `write()` | `cards.jsonl` | Debounced rewrite (1s) of global static dashboard cache. |

---

## 3. MCP Tools & Session Logging Audit

### A. Registered MCP Tools Catalog
The environment exposes two primary MCP endpoints over loopback JSON-RPC 2.0:

Both tool lists grow often — a fixed count here goes stale fast (last checked 2026-10-07: site had 12, Servex had 77). Don't trust the numbers below; count a fresh session's own deferred-tools list instead (`mcp__site__*`, `mcp__servex__*`) before relying on either being complete.

1. **Site Dev Server MCP (`http://monorepo.localhost/mcp`)** — was `pages`, `eval`, `shot`, `claim`, `release` only; now also seven `research_*` tools (`research_agent`, `research_log`, `research_outline`, `research_say`, `research_summary`, `research_verdict`, `research_vote`) for the [research](/framework/research/) program.

2. **Servex MCP (`http://servex.localhost/mcp`)**:
   - **Agent Control**: `spawn_agent`, `fork_self`, `wait_for_agent`, `send_to_agent`, `interrupt_agent`, `list_agents`, `stop_agent`.
   - **Operations**: `restart_servex`, `pause_dispatch`, `resume_dispatch`, `system_health`.
   - **Background Jobs**: `start_job`, `job_result`.
   - **Knowledge & Experts**: `ask_expert`, `list_experts`, `load_module`, `readme_modules`, `ask_directory`, `ask_module`, `ask_manager`.
   - **Worktree Pool**: `take_worktree`, `return_worktree`.
   - **Cards & Inbox**: `create_card`, `create_page`, `read_card`, `attach_card`, `list_cards`, `card_ask`, `card_reply`, `card_set`, `card_summary`, `list_waiting`, `drop`, `clear`, `inbox`, `add_item`, `amend_bubble`, `place`.
   - **Live Pages (`page.jsonl`)**: `page_call`, `page_add`, `page_set`, `page_log`, `page_read`, `page_reply`.
   - **Tasks & Status**: `snooze_task`, `kill_task`, `reprioritise_task`, `close_task`, `task_loop_status`, `heartbeat_status`.
   - **Voice & Quick-Fix**: `session_summary`, `session_line`, `quick_fix`, `quick_fix_landed`, `dir_log`, `refine_step`.
   - **Server Management**: `list_servers`, `start_server`, `check_page`, `restart_server`, `stop_server`, `server_logs`, `append_log`.
   - **Topics & Sessions**: `claim_topic`, `release_topic`, `list_claims`, `follow`, `unfollow`, `list_follows`, `register_session`, `set_focus`, `set_layout`, `list_pages`, `list_servers`.
   - (This list is still not guaranteed exhaustive — see the caveat above.)

3. **Antigravity Builtin Harness**:
   - Connects to `site` and `servex` via `~/.gemini/config/mcp_config.json`.
   - Integrates native primitives: `run_command`, `write_to_file`, `replace_file_content`, `view_file`, `search_web`, `read_url_content`, `schedule`, `manage_task`, `invoke_subagent`, `send_message`.

### B. Session Logging Audit & Critical Gaps
Auditing how tool calls are logged revealed significant architectural gaps between repo-level task logs, Servex agent logs, and runtime transcripts:

1. **`task.jsonl` Does Not Record Tool Calls**:
   - `task.jsonl` files in task directories (`public/framework/ai/YYYY-MM-DD/<task>/`) only contain metadata (`assign`), manual logs from `append.mjs`, or verb lines (`snooze`, `kill`, `priority`).
   - Claude Agent SDK tool executions are **never written to `task.jsonl`**.
2. **Servex Session Logs (`%LOCALAPPDATA%/lew42/servex/logs/agent-<id>.jsonl`)**:
   - Tool calls are intercepted in `Agents.Agent.assistant(message)`:
     `this.emit({ type: "tool", name: block.name, input: this.summary(block.input), nested });`
   - **Input Truncation**: `this.summary()` truncates tool input arguments to 200 characters. Detailed payloads (file content, long prompts) are lost.
   - **Tool Results Dropped**: `tool_results(message)` only inspects return blocks for the spend-gate allowance unlock. It **never calls `this.emit()`** for tool outputs. Return values, tool errors, and diff outputs are completely absent from the session log.
3. **Full Transcripts Exist Only in CLI/SDK Cache**:
   - Full, untruncated transcripts reside exclusively in Anthropic's local project directory:
     `%USERPROFILE%/.claude/projects/C--Code-lew42-monorepo/<session-id>.jsonl`.
   - Antigravity stores its own full transcripts under `<appDataDir>/brain/<conversation-id>/.system_generated/logs/transcript_full.jsonl`.

### C. Design: Nested Session Log View
To allow the owner to inspect all prompts, tool calls, arguments, and return values without opening shell sessions:

1. **Data Source Integration**:
   - Introduce `GET /api/session/trace?id=<agent-or-session-id>` in Servex.
   - For active Servex agents: read from `agent-<id>.jsonl` augmented with live tool-result emissions.
   - For completed sessions: parse `%USERPROFILE%/.claude/projects/.../<session-id>.jsonl` directly.
2. **Logging Layer Fix in `Agents.js`**:
   - In `tool_results(message)`, emit `{ type: "tool_result", tool_use_id, is_error, output: clip(b.content, 4000) }`.
   - Preserve full arguments in a companion trace or extend `summary()` ceiling.
3. **UI Implementation (`public/framework/ext/Session/Drawer.js` or Card Right Sidebar)**:
   - Mount a third collapsible column (`$sub`) beside the card detail pane.
   - **Hierarchical Tree Display**:
     - Turn root: Prompt / Envelope.
     - Thinking / CoT collapsible block.
     - Tool Invocation pill (`[Tool: Read] path/to/file`):
       - Expandable accordion showing full JSON input.
       - Expandable accordion showing tool output or error state.
       - Execution elapsed time (`ms`) and token cost.
     - Nested subagent rows indented with distinct role badges (`minion`, `helper`).

---

## 4. Git Commit Hygiene & Status Audit

### A. Why ~700 Untracked Files Exist
A repository audit (`git status -s`) revealed 700 untracked paths, with 659 residing under `public/framework/ai/`.

1. **The 2026-10-01 Incident Recovery**:
   - On 2026-10-01 at 22:36, an agent erroneously executed `rm -rf` across untracked files in the main checkout (`accidental-rm-rf-of-601-untracked-paths`).
   - The recovery mission (`recover-main-untracked`) restored 595 files but explicitly mandated:
     *"Never run git clean, checkout --, reset, stash or any rm in main. Restored files stay untracked, exactly as they were — commit nothing."*
   - Consequently, hundreds of historical task logs and card folders were left untracked.
2. **Ephemeral vs Tracked File Inconsistencies**:
   - Cards (`YYYY/MM/DD/<card>/page.jsonl`) and task folders (`YYYY-MM-DD/<task>/task.jsonl`) are generated on disk during daily workflows without automatic git staging.
   - `.gitignore` only ignores specific subfolders (`shots/`, `recordings/`, `health/*.jsonl`, session patterns `session-*/`), leaving top-level dated task folders untracked by default.

### B. Mechanisms Ensuring Agents Commit Work
- **Worktrees (`Pool.js`)**: Worktrees enforce cleanliness on `return_worktree` (dirty worktrees are rejected with an explicit error list).
- **Merge Pipeline (`Server/merge.mjs`)**: Automatically commits clean branches to `michael/dev`. Recent commit `a5cc0a04` enabled auto-commit for clean three-way landings.
- **Main Checkout Gap**: Agents running directly in the main repository checkout currently have **no automated enforcement** preventing them from completing turns while leaving uncommitted files.

**Recommendation**: Add an explicit check in `finish-task` and `Agents.stop()` that verifies git working tree status and prompts or auto-commits dirty working files created during the task lifecycle.
