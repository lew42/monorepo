# Inventory of every Servex MCP tool

## Counts

- **Script found: 108** tool definitions (file:line), from `git grep -noE 'tool\("[a-z_]+"'` and `git grep -noE '^\s*name:\s*"[a-z_]+"'` over `Servex/` + `Server/DatedFiles.mjs`, excluding `*.test.mjs` and `*-proof.mjs`, then hand-checked against their surrounding code (see "What the script got wrong" below).
- **The given list has: 103** names (the brief's copy of a live session's tool list, plus the 6 `mcp__local__*` page/item tools).
- **Differences:**
  - Script found **5 names the list does not have**: `ask_mastermind`, `call`, `cloud_voice_log`, `voice_hear` (all four defined only in `Servex/ext/remote/RemoteMCP.js` — the cloud/remote voice door, never served to a local Servex-spawned agent) and `query_sessions` (defined in `Servex/agents/tools.js:81` but explicitly opt-in — `tools-map.md` says it's "not in the list unless a role adds it").
  - **0 names the list has that the script did not find** — every one of the 103 given names resolved to a real definition.

### What the script got wrong on the first pass (so the next run skips this)

- `tool("name", ...)` also matches a **call site**, not just a definition: `Servex/Lifecycle.js` calls `this.tool("card_reply", …)` / `this.tool("stop_agent", …)` / `this.tool("return_worktree", …)` through its own `tool(name, args)` dispatcher (line 369) — 3 false hits, excluded.
- `Servex/ext/refine/VoicePage.js` has the same shape: its own `async tool(name, args)` (line 48) calls `this.tool("page_read"/"page_add"/"page_set", …)` — 3 more false hits, excluded.
- `{ name: "..." }` also matches: `Servex/MCP.js:40` and `Servex/agents/tools.js:605` (`{ name: "servex", ... }`, the MCP *server's* own name, not a tool), `Servex/Servex.js:511,551` (`{ name: "whisper" }`, `{ name: "llama" }`, dev-process names for Process.Whisper/Process.Llama) and `Servex/ext/recite/recite.js:51` (`{ name: "recite" }`, same thing), `Servex/agents/page_tools.js:584` (`{name: "doc"}`, a method-name entry in a class's `callable` list, nothing to do with MCP), `Servex/agents/Dispatcher.js:116` (`"prompts"` inside a comment showing example `append_log` usage, not a real tool), and `Servex/ext/openrouter/evals/library.mjs:167` (a JSON-RPC *call* to `system_health`, not its definition). All excluded.
- Several tools are defined **outside the brief's named file list**: `Servex/agents/directory.js` (`ask_directory`), `Servex/agents/claims.js` (`claim_topic`, `release_topic`, `list_claims`), `Servex/agents/inbox.js` (`drop`, `clear`, `inbox`, `page_note`), `Servex/Follow.js` (`follow`, `unfollow`, `list_follows`), `Servex/Pool.js` (`take_worktree`, `return_worktree`), `Servex/agents/ModuleInbox.js` (`module_inbox`), `Server/DatedFiles.mjs` (`move_project`, `dated_create`, `dated_query`), `Servex/agents/Assistant.js` (`append_prompt_event`, `file_to_group`, `card_reply`), `Servex/agents/Echo.js` (`refine_step`), `Servex/agents/External.js` (`updates`, `register_session`), `Servex/agents/Global.js` (`set_focus`). The brief's file list is a starting point, not exhaustive — `Servex.js` wires most of these in with a `for (const tool of X.tools()) this.mcp.tool(tool)` loop, one line per source file, which is the fastest way to find the rest (`git grep -n "this.mcp.tool(tool)" Servex/Servex.js`).

## Table (sorted by mark, then name)

`name · file:line · what it does · mark · why`

| name | file:line | what it does | mark | why |
|---|---|---|---|---|
| add_item | Servex/agents/Layers.js:1043 | Add/update one outline line on a card | item | writes a card record |
| amend_bubble | Servex/agents/Layers.js:1052 | Clean up a chat bubble's raw prompt pieces | item | writes a card record |
| append_log | Servex/Servex.js:1084 | Append one validated event to a named log | item | writes a log record |
| append_prompt_event | Servex/agents/Assistant.js:159 | Append one typed event to the owner's prompt log | item | writes a log record |
| card_reply | Servex/agents/Assistant.js:199 | Say something into a card's own chat log | item | writes a card record |
| card_set | Servex/agents/Layers.js:1034 | Change a card's type, title, status or tags | item | writes a card record |
| card_summary | Servex/agents/Layers.js:1092 | Write one summary line for a card or page | item | writes a card/page record |
| card_ask | Servex/cards/Cards.js:616 | Ask the owner something on a card's widget | item | writes a card record |
| claim_topic | Servex/agents/claims.js:87 | Claim a thing you're about to change | item | writes the claims record |
| clear | Servex/agents/inbox.js:237 | Clear one note from a page's inbox | item | writes an inbox record |
| close_task | Servex/Servex.js:1133 | Mark a task closed | item | writes a task record |
| create_card | Servex/cards/Cards.js:542 | The only way to make a card | item | writes a card record |
| create_page | Servex/pages.js:90 | Make a new child page reliably | item | writes a page record |
| dated_create | Server/DatedFiles.mjs:364 | Make a new dated project under a module | item | writes a dated project record |
| dated_query | Server/DatedFiles.mjs:370 | Query the projects index | item | reads a dated project record |
| dir_log | Servex/agents/tools.js:322 | Append one line to a folder's ai/log.jsonl | item | writes a log record |
| drop | Servex/agents/inbox.js:232 | Leave a coordination note on any page | item | writes an inbox record |
| file_to_group | Servex/agents/Assistant.js:183 | File the owner's words into a group | item | writes a group record |
| inbox | Servex/agents/inbox.js:240 | The open notes in one page's inbox | item | reads an inbox record |
| item | Servex/agents/page_tools.js:1842 | Generic get/set/call on any Item-reachable record | item | the generic record door itself |
| kill_task | Servex/agents/tools.js:161 | Kill a stalled task | item | writes a task record |
| list_cards | Servex/cards/Cards.js:607 | List cards as short summaries | item | reads card records |
| list_claims | Servex/agents/claims.js:99 | Who is working on what, right now | item | reads the claims record |
| list_follows | Servex/Follow.js:401 | List what you're following | item | reads a follows record |
| list_pages | Servex/pages.js:73 | List a page's child pages | item | reads page records |
| list_waiting | Servex/cards/Cards.js:632 | Everything waiting on the owner right now | item | reads card records |
| log | Servex/agents/tools.js:347 | The one door for a JSONL log line | item | writes a log record |
| log_session | Servex/agents/tools.js:273 | Record a voice session event | item | writes a session record |
| module_inbox | Servex/agents/ModuleInbox.js:101 | Drop an owner ask into a module's inbox | item | writes an inbox record |
| move_project | Server/DatedFiles.mjs:354 | Move a project folder into a module | item | moves a dated project record |
| owner_note | Servex/cards/Cards.js:577 | The one way to tell the owner something | item | writes a card record |
| page_add | Servex/agents/page_tools.js:1802 | Alias of page_set: add one card | item | writes a page record (fold into item) |
| page_call | Servex/agents/page_tools.js:1785 | Alias of page_set: one method call at a target | item | writes a page record (fold into item) |
| page_log | Servex/agents/page_tools.js:1848 | Alias of page_set: the "now doing X" line | item | writes a page record (fold into item) |
| page_note | Servex/agents/inbox.js:243 | Leave a note for whoever reads this page next | item | writes a page record |
| page_read | Servex/agents/page_tools.js:1863 | The page's current state, replayed fresh | item | reads a page record |
| page_reply | Servex/agents/Layers.js:1082 | Say something into a page's or card's chat | item | writes a page/card record |
| page_set | Servex/agents/page_tools.js:1824 | THE page tool: append one JSON delta | item | writes a page record |
| place | Servex/pages.js:122 | Append {place: what} to a page.jsonl | item | writes a page record |
| quick_fix | Servex/agents/tools.js:297 | Send a small fix straight to the fixer | item | writes a page/queue record |
| quick_fix_landed | Servex/agents/tools.js:310 | Record a quick fix's real landing time | item | writes a page/queue record |
| read_card | Servex/cards/Cards.js:589 | A card's whole log, oldest first | item | reads a card record |
| read_page | Servex/pages.js:80 | Read a page's lines or declared fields | item | reads a page record |
| refine_step | Servex/agents/Echo.js:432 | One refine step (references/asks/done) | item | writes a refine-log record |
| register_session | Servex/agents/External.js:186 | Register an external session as an addressable agent | item | writes a session registry record |
| release_topic | Servex/agents/claims.js:96 | Release a claimed thing | item | writes the claims record |
| rename_session | Servex/agents/tools.js:255 | Retitle a voice session | item | writes a session record |
| reprioritise_task | Servex/agents/tools.js:179 | Reprioritise a task | item | writes a task record |
| retract_say | Servex/agents/tools.js:237 | Take a queued say back | item | writes a session record |
| say | Servex/agents/tools.js:217 | Queue one reply for the single-seat owner | item | writes a session record |
| session_line | Servex/agents/tools.js:287 | One session log line (refine/edit/summary) | item | writes a session record |
| session_summary | Servex/agents/tools.js:245 | Give a voice session a title and summary | item | writes a session record |
| set_focus | Servex/agents/Global.js:532 | Write today's one-sentence focus | item | writes a log record |
| set_layout | Servex/pages.js:130 | Append {layout: name} to a page.jsonl | item | writes a page record |
| unfollow | Servex/Follow.js:397 | Stop following something | item | writes a follows record |
| updates | Servex/agents/External.js:177 | What arrived for you since your last call | item | reads an inbox record |
| attach_card | Servex/cards/Cards.js:594 | Put an agent on a card | keep | wakes/attaches a live process, not a record field |
| ask_directory | Servex/agents/directory.js:243 | Spawn a fresh folder mastermind to answer a question | keep | spawns a fresh agent |
| ask_expert | Servex/agents/Experts.js:315 | Ask a module's expert checkpoint one question | keep | forks a cached session |
| ask_manager | Servex/agents/Layers.js:1078 | Hand work to a card's or page's manager | keep | routes to a live agent |
| ask_mastermind | Servex/ext/remote/RemoteMCP.js:55 | Ask the project mastermind (cloud voice door) | drop | deprecated 2026-11-06; use send_to_agent/spawn_agent |
| ask_module | Servex/agents/Layers.js:1102 | One-shot fork answering a question about a module | keep | forks a fresh process |
| audit_session | Servex/agents/tools.js:262 | Audit a voice session | keep | runs a process-level audit |
| call | Servex/ext/remote/RemoteMCP.js:41 | Call any Servex tool by name (cloud voice door) | keep | the voice door's generic relay |
| cancel_wake | Servex/agents/Wakeups.js:99 | Cancel a scheduled wake-up | keep | cancels a process timer |
| check_page | Servex/Servex.js:1052 | Load a URL in the shared headless Chromium | keep | drives a browser process |
| check_usage | Servex/Servex.js:1126 | Usage against the pace budget | keep | reads process/usage state |
| cloud_voice_log | Servex/ext/remote/RemoteMCP.js:47 | File the owner's exact words (cloud voice door) | keep | the voice door |
| compact_self | Servex/agents/tools.js:549 | Compact your own context | keep | acts on your own process |
| edit_file | Servex/files.js:98 | Replace one exact string in a file | keep | raw filesystem, not an Item record |
| follow | Servex/Follow.js:389 | Subscribe to a log's new lines | keep | wires a live-delivery process |
| fork_self | Servex/agents/tools.js:441 | Ask a background copy of yourself one question | keep | spawns a process |
| glob | Servex/files.js:110 | Find paths matching a glob | keep | raw filesystem |
| heartbeat_status | Servex/Servex.js:1153 | The heartbeat's own status | keep | reads process state |
| interrupt_agent | Servex/agents/tools.js:541 | Stop an agent mid-sentence | keep | acts on a live process |
| job_result | Servex/agents/Jobs.js:298 | A background job's result | keep | reads a running job/process |
| list_agents | Servex/agents/tools.js:562 | Every agent Servex has registered | keep | reads process/registry state |
| list_dir | Servex/files.js:108 | List a folder's entries | keep | raw filesystem |
| list_experts | Servex/agents/Experts.js:331 | Every module expert checkpoint | keep | reads checkpoint files |
| list_servers | Servex/Servex.js:1038 | Every project Servex found, port and state | keep | reads process state |
| list_wakes | Servex/agents/Wakeups.js:102 | Wake-ups still pending | keep | reads process timers |
| load_module | Servex/agents/Experts.js:349 | Load one or more modules' readmes/files at once | keep | raw filesystem read |
| nothing | Servex/agents/tools.js:230 | End the turn with no reply, a pure no-op | keep | no record touched at all |
| pause_dispatch | Servex/agents/ops.js:47 | Pause Servex's own dispatch loop | keep | acts on the process |
| query_sessions | Servex/agents/tools.js:81 | Find past sessions like the dashboard does, and cost | keep | opt-in process/usage query |
| read_file | Servex/files.js:86 | Read a text file | keep | raw filesystem |
| resume_dispatch | Servex/agents/ops.js:57 | Resume Servex's own dispatch loop | keep | acts on the process |
| restart_server | Servex/Servex.js:1067 | Stop and start a project's dev server | keep | acts on a server process |
| restart_servex | Servex/agents/ops.js:27 | Restart Servex itself | keep | acts on the Servex process |
| return_worktree | Servex/Pool.js:101 | Hand a worktree back to the pool | keep | acts on a worktree/process |
| send_to_agent | Servex/agents/tools.js:492 | Say something to a running agent | keep | talks to a live process |
| server_logs | Servex/Servex.js:1073 | The last lines of a named log | keep | reads a process's own log |
| shell | Servex/files.js:115 | Run a command, return stdout/stderr/exit code | keep | runs a process |
| skill | Servex/agents/tools.js:134 | The full text of a named skill | keep | raw filesystem read |
| snooze_task | Servex/agents/tools.js:148 | Snooze a task | keep | acts on the task scheduler |
| spawn_agent | Servex/agents/tools.js:390 | Start a new Claude session and give it a job | keep | spawns a process |
| start_job | Servex/agents/Jobs.js:285 | Hand background work to Servex's node process | keep | runs a process |
| start_server | Servex/Servex.js:1041 | Start a project's dev server | keep | acts on a server process |
| stop_agent | Servex/agents/tools.js:581 | End a session for good | keep | stops a process |
| stop_server | Servex/Servex.js:1070 | Stop a project's dev server, leave it stopped | keep | acts on a server process |
| system_health | Servex/Servex.js:1108 | Servex's own health | keep | reads process/machine state |
| take_worktree | Servex/Pool.js:92 | Take a ready quick-fix worktree | keep | acts on a worktree/process |
| task_loop_status | Servex/Servex.js:1148 | The task dispatch loop's own status | keep | reads process state |
| voice_hear | Servex/ext/remote/RemoteMCP.js:35 | Hear what the mastermind has said so far | keep | the voice door |
| wait_for_agent | Servex/agents/tools.js:470 | Wait until an agent finishes its turn | keep | blocks on a live process |
| wake_me | Servex/agents/Wakeups.js:90 | Ask node to wake you later | keep | schedules a process timer |
| write_file | Servex/files.js:91 | Write (create/overwrite) a text file | keep | raw filesystem |
| readme_modules | Servex/agents/Experts.js:354 | The read-me verb, same bundle as load_module | drop | literal duplicate handler of load_module (7 refs, same `run()`) |

## Totals (counted by script, not by eye: `grep -cE` per mark column)

- **item: 56**
- **keep: 50**
- **drop: 2** (`ask_mastermind`, `readme_modules`)
- **56 + 50 + 2 = 108** ✓ matches N (the script's count of tool definitions).
