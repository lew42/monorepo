# Map: Servex/agents/

Every file at the top level of `Servex/agents/`, one line each. Model: [core/Item/readme.md](/framework/core/Item/readme.md)'s Map, commit `59fcd6650`.

| File | What it does |
|---|---|
| [Agents.js](./Agents.js) | the host, the agent, its queue: `spawn()` (`:145`), `door()` for its MCP (`:1497`), the real `claude.exe` child (`:1463`) |
| [tools.js](./tools.js) | every MCP tool, grouped (`own`, `ops_tools`, `wake_tools`, `job_tools`, `expert_tools`, `session_tools`, `task_tools`, `page_tools`, `skill_tools`, `log_tools`) |
| [page_tools.js](./page_tools.js) | `item`, `page_set`/`page_add`/`page_call`/`page_read`/`page_log`/`page_note`: `page_tools()` (`:1780`) ([doc/item-tool.md](../doc/item-tool.md)) |
| [Assistant.js](./Assistant.js) (+ [assistant.md](./assistant.md)) | the always-up fast assistant and its posture |
| [Dispatcher.js](./Dispatcher.js) | watches the `prompts` log for `route: "task"` and spawns a `page-mastermind` (Sonnet, medium); at most two run at once, registered as a fake "parent" agent `dispatcher` |
| [Registry.js](./Registry.js) | who has ever been spawned, and which host holds it |
| [roles.js](./roles.js) | role → posture (model, skills); [roles-json.mjs](./roles-json.mjs) writes `core/Role/roles.json` from these rows (`--check` exits 1 when stale) |
| [roles/](./roles/readme.md) | each role's own readme, as Servex hands it to a spawned agent (two retired names redirect here: [ai-system-mastermind.md](./roles/ai-system-mastermind.md), [servex-mastermind.md](./roles/servex-mastermind.md)) |
| [tiers.js](./tiers.js) | model tiers (`voice_fast`, `voice_smart`, `architect`, `scan`, …) a role resolves to |
| [policy.js](./policy.js) | spend/role policy checks |
| [claims.js](./claims.js) | `claim_topic`/`release_topic`: one agent at a time on a named topic |
| [ChatWriter.js](./ChatWriter.js) | mirrors each `{chat}` line `Sessions.write()` makes into the session's real chat list, `session.messages`/`session.sentences` |
| [Sessions.js](./Sessions.js) | a voice session's fast and smart seats; `ensure_mastermind()`; per-session `plugins` |
| [WakePolicy.js](./WakePolicy.js) | when a voice session's smart seat is woken — a question that ends asking wakes it, a mid-dictation "?" does not |
| [Wakeups.js](./Wakeups.js) | wake-ups that survive a restart: the `wake_me` tool, instead of a sleep/background shell alive in the agent's own process |
| [Respawn.js](./Respawn.js) | the standing system architect gets a fresh session about once a day, never mid-task, same id ([doc/lifecycle.md](../doc/lifecycle.md)) |
| [External.js](./External.js) | registers a VS Code tab (`vscode-<id8>`, `kind: "external"`); `send_to_agent` to it appends to its inbox file, read on its next turn |
| [Fixer.js](./Fixer.js) (+ [fixer.md](./fixer.md)) | the fast path from "fix this" to a live edit; never edits a page itself — the actual edit/commit is elsewhere |
| [Echo.js](./Echo.js) (+ [echo.md](./echo.md)) | the prompt-refinement pipeline |
| [Hitl.js](./Hitl.js) | the smart assistant's two small-model calls for human-in-the-loop checks |
| [tidy.js](./tidy.js) | revises one chunk of dictated or rambling text at a chosen LEVEL |
| [directory.js](./directory.js) | `ask_directory({dir, question, session?})`: a FRESH mastermind for one folder, started from its plain files |
| [inbox.js](./inbox.js) | `class Inbox`: every page's inbox (notes, questions, tasks); `claims.js` calls its `coordinator()` |
| [ModuleInbox.js](./ModuleInbox.js) | a module's own `<folder>/inbox.jsonl`, append-only, one line per essence of an owner ask |
| [Subpages.js](./Subpages.js) | add/rename/remove the subpages of one parent folder — the one implementation behind `page_set({pages:{...}})` and `create_page` |
| [Promote.js](./Promote.js) | promotes one block of a `page.jsonl` page to its own child page, leaving a `part-link` in its place |
| [PromptLines.js](./PromptLines.js) | the delta lines that make a session's chat: a Prompt task holding the owner's raw words, cleaned paragraphs, replies anchored to a sentence, nested Questions |
| [PromptTasks.js](./PromptTasks.js) | files a task only from a turn a person actually typed, never a scheduled check-in or a notification |
| [Layers.js](./Layers.js), [Global.js](./Global.js) | the card and cross-card agents ([doc/layers.md](../doc/layers.md)) |
| [Chain.js](./Chain.js) (+ [chain-fast.md](./chain-fast.md)) | the flagged one-global-assistant chain, `SERVEX_CHAIN=on` ([doc/assistant-chain.md](../doc/assistant-chain.md)) |
| [Experts.js](./Experts.js) | module experts: a checkpoint per module, `ask_expert`, `load_module` ([doc/experts.md](../doc/experts.md)) |
| [readme-chain.js](./readme-chain.js) | a fresh, directory-bound agent's opening context: the readme chain prepended to its first message ([../doc/readme-chain.md](../doc/readme-chain.md)) |
| [handoff-note.js](./handoff-note.js) | `handoff_note()`: a handoff's first message quotes the owner's own raw words, read off the task before `move_item` runs |
| [ops.js](./ops.js) | restart, pause, resume |
| [Jobs.js](./Jobs.js) | background work in node ([doc/jobs.md](../doc/jobs.md)) |
| [turn-costs.js](./turn-costs.js) | each turn's real dollars from an agent's log, so a resumed session's running total is not double-counted |
| [site-hooks.mjs](./site-hooks.mjs) | a node module hook: a site-absolute import (`/framework/...`) resolves under `public/`, the way the dev server serves it |
| [test-store.mjs](./test-store.mjs) | imported first by any test that spawns through the real `Agents` class, before every other import |
| [roles-json.mjs](./roles-json.mjs) | see the `roles.js` row above |
| [move-voice-sessions.mjs](./move-voice-sessions.mjs), [voice-backfill.mjs](./voice-backfill.mjs) | one-off moves of old flat voice-session files into the dated central store (dry run by default, `--apply` writes) |
| [echo-replay.mjs](./echo-replay.mjs) | given a past `session_id`, replays that session's real prompt+reply pairs off Claude Code's own transcript |
| [demo.mjs](./demo.mjs) | `node Servex/agents/demo.mjs`: the live two-minute, $0.09 demo in the readme's intro |
| [master-assistant.md](./master-assistant.md) | the root page's own assistant: one of the two roles every page gets |
| [mastermind-servex.md](./mastermind-servex.md) | mastermind-servex's own brief: the systems architect over every card's agents |
| [session-fast.md](./session-fast.md), [session-smart.md](./session-smart.md) | the fast and smart seats' own briefs (no role readme) |
| [single-voice-assistant.md](./single-voice-assistant.md) | the one agent of a voice session whose setting is `single` |
| [inbox.jsonl](./inbox.jsonl), [page.jsonl](./page.jsonl), [failures.jsonl](./failures.jsonl) | this folder's own module inbox, page-as-log data, and layout-check failures — one row |
| [groups.fixture.json](./groups.fixture.json) | fixture data for [groups.test.mjs](./groups.test.mjs) (the lobby's word-grouping) |
| `*.test.mjs` | `ChatWriter.move.test.mjs`, `ChatWriter.order.test.mjs`, `Dispatcher-task.test.mjs`, `External.test.mjs`, `Follow-ack.test.mjs`, `ModuleInbox.test.mjs`, `PromptLines.say.test.mjs`, `PromptLines.test.mjs`, `Question-dedupe.test.mjs`, `Sessions.mastermind.test.mjs`, `Sessions.plugins.test.mjs`, `Sessions.single.test.mjs`, `Sessions.test.mjs`, `WakePolicy.test.mjs`, `awaken-race.test.mjs`, `card-messages.test.mjs`, `chat-messages.test.mjs`, `child-follow.test.mjs`, `child-links.test.mjs`, `close-loop.test.mjs`, `compact-before-sleep.test.mjs`, `compact-nudge.test.mjs`, `context-alert.test.mjs`, `cost.test.mjs`, `crash-revive.test.mjs`, `fixer.test.mjs`, `global.test.mjs`, `groups.test.mjs`, `handoff-route.test.mjs`, `handover.test.mjs`, `honest-completion.test.mjs`, `item-backbone.test.mjs`, `item-generic.test.mjs`, `item-local.test.mjs`, `item-read.test.mjs`, `item-verbs.test.mjs`, `item_tool.test.mjs`, `landing-check.test.mjs`, `layers.test.mjs`, `log-tool.test.mjs`, `one-writer.test.mjs`, `open-task.test.mjs`, `page_tools.test.mjs`, `path-mastermind.test.mjs`, `policy.test.mjs`, `prompt-tasks.test.mjs`, `readme-chain.test.mjs`, `ref-cache.test.mjs`, `requests.test.mjs`, `respawn.test.mjs`, `revive-skip.test.mjs`, `revive-sweep.test.mjs`, `role-system.test.mjs`, `roles.test.mjs`, `say-tools.test.mjs`, `seat-cost.test.mjs`, `send-alias.test.mjs`, `session-entries.test.mjs`, `session-query-record.test.mjs`, `session-route-tasks.test.mjs`, `session-state.test.mjs`, `session_tasks.test.mjs`, `single-brief.test.mjs`, `skill-tool.test.mjs`, `spawn-parent.test.mjs`, `spawn-worktree.test.mjs`, `task-origin.test.mjs`, `turn-costs.test.mjs`, `verb-note.test.mjs`, `voice-backfill.test.mjs`, `wakeups.test.mjs` |
| `*-proof.mjs` / `*.proof.mjs` | `chain-proof.mjs`, `experts-proof.mjs`, `fork-proof.mjs`, `hitl.proof.mjs`, `jobs-proof.mjs`, `landed-reap-proof.mjs`, `layers-proof.mjs`, `openrouter-cost-blind-proof.mjs`, `page-assistant-proof.mjs`, `queue-proof.mjs`, `relay-bypass-proof.mjs`, `revive-guard-proof.mjs`, `revive-proof.mjs`, `spend-gate-proof.mjs`, `voice-models-proof.mjs`, `wake-proof.mjs` — end-to-end proofs, one scenario each, not unit tests |
| [doc/](./doc/) | the detail; see the readme's "Design" list for which exist |
| [readme.md](./readme.md) | this module's index |
