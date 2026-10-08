# Tools, flows, harness — audit

## Tools

| Tool | What it does | Who calls it |
|---|---|---|
| Servex MCP: `spawn_agent`/`fork_self`/`wait_for_agent`/`send_to_agent`/`interrupt_agent`/`list_agents`/`stop_agent` | start, message, watch, stop a Claude session that lives inside Servex | mastermind, other agents |
| Servex MCP: `start_job`/`job_result` | fire-and-forget async work, collect the answer later | any agent |
| Servex MCP: `restart_servex`/`pause_dispatch`/`resume_dispatch` | operator controls over Servex itself | mastermind, the owner |
| Servex MCP: `list_servers`/`start_server`/`restart_server`/`stop_server`/`server_logs`/`append_log` | supervise dev servers, write logs as the one safe writer | any agent (never kill by hand) |
| Servex MCP: `system_health`/`close_task`/`task_loop_status`/`heartbeat_status` | status reads for the dashboard and the loop | mastermind, dashboard |
| Servex MCP: `list_pages`/`read_page`/`create_page`/`place`/`set_layout` | make and fill a page's `page.jsonl` without hand-editing files | agents building pages |
| Servex MCP: `card_set`/`add_item`/`amend_bubble`/`ask_manager`/`card_summary`/`card_reply`/`create_card`/`read_card`/`attach_card`/`list_cards` | the owner-facing dashboard card, its outline, its chat | any agent reporting to the owner |
| Servex MCP: `claim_topic`/`release_topic`/`list_claims` | soft lock so two cards don't touch the same thing at once | any agent before editing something shared |
| Site MCP (`Server/plugins/MCP.js`): `pages`/`eval`/`shot`/`claim`/`release` | list open tabs, read DOM truth, screenshot, claim a tab for driving | any agent testing the live site |
| Site MCP (`Server/plugins/Research.js`): `research_say`/`research_vote`/`research_verdict`/`research_agent`/`research_log`/`research_outline`/`research_summary` | the research program's append-only log and rounds | research agents |
| In-process SDK tools (`Servex/agents/tools.js` via `createSdkMcpServer`) | the same seven agent verbs, handed to an in-process (not CLI) agent | Servex-hosted agents that aren't full CLI sessions |
| Node CLI (`Server/*.mjs`): `hold.mjs`, `merge.mjs`, `task-cost.mjs`, `layout-check.mjs`, `padding-check.mjs`, `text-check.mjs`, `doc-check.mjs`, `decide.mjs`, `worktree-up/down/sweep.mjs`, `review.mjs`, `smoke.mjs` | reload holds, worktree smoke-test+merge, cost report, layout/padding/text/doc audits, decision records, worktree lifecycle, PR-style review, boot smoke-test | agents, run by hand from Bash |
| Hooks (`.claude/hooks/*.mjs`): `append.mjs`, `prompt-relay.mjs`, `naming-guard.mjs`, `syntax-guard.mjs`, `hold-guard.mjs`, `ledger.mjs` | safe JSONL append, prompt transcription + assistant relay, name-collision check, post-write syntax check, hold-fence enforcement, per-session event ledger | the harness, automatically, on every matching event |

## Flows

| Flow | Step | DONE-BY |
|---|---|---|
| (a) Task creation | brief names a task dir → Servex writes line 1 via `spawn_agent`'s `task:{dir,card,brief}` | NODE |
| | brief does NOT name one → agent runs `new-task`: mkdir, requirements.md, launch line, day.jsonl | AI-FOLLOWING-SKILL |
| | keeping `steps`/`step`/decisions/logs current as work proceeds | AI-FOLLOWING-SKILL |
| | closing report + `landed_at` | AI-FOLLOWING-SKILL (finish-task) |
| (b) Owner's prompt | every prompt → transcript line in `.claude/prompts/<day>.jsonl` | NODE (hook, unconditional) |
| | assistant-marked session → inbox `chat` line + V3 board card | NODE (hook, once marked) |
| | becoming "marked" as the assistant in the first place | AI-FOLLOWING-SKILL (loads `every-prompt`/`assistant` once; `ledger.mjs` then marks it) |
| | turning a raw prompt into a readable card section (`amend_bubble`) | AI-FOLLOWING-SKILL |
| (c) Transcription logging | mic → Whisper → `Socket.singleton().async_rpc("append", …)` into `prompts.jsonl` | NODE (Dictate.js + Server rpc:append) |
| | `prompts.jsonl` line → a dashboard card the owner actually sees | AI-FOLLOWING-SKILL (no automatic writer found) |

Evidence an AI step is where it breaks: session_id omitted from a launch line → "the detail page has no transcript and renders no log at all" (new-task skill). Layout skill skipped on 40 tasks (09-24/25) → the owner's top complaint was empty wide pages (minion skill, layout section). A minion wrote `landed_at` in its parent's `task.jsonl` on 2026-09-28 → the whole task looked finished and its live server got stopped mid-work (minion skill, Landing section). A hold without `--paths` blocked the owner's own tab for 220s on 2026-09-22 (minion skill, reload-hold section).

## Top 6 steps to move skill → node (ranked, failures prevented ÷ effort)

1. **`new-task` line 1 when a brief already names a dir** — already half-fixed by `spawn_agent`'s `task` param; extend it so no brief can start editing without a `session_id`-carrying line. Kills the "no transcript at all" failure outright, cheap (the field already exists).
2. **`finish-task`'s `landed_at`** — a node "land" tool that refuses to write `landed_at` into any file but the caller's OWN task dir (path check), closing the 09-28 wrong-file failure for good.
3. **Reload-hold `--paths`** — make `hold.mjs on` refuse to run without `--paths` at all (today it silently falls back and just warns). One `if`, prevents a repeat of the 220s global block.
4. **Layout/padding/text checks at landing** — `layout-check.mjs`/`padding-check.mjs` already exist; wire them into the same node path that writes `landed_at`, so a task cannot land without having been screenshotted at four widths. Removes reliance on the agent remembering to load `layout`.
5. **prompts.jsonl → card** — the one AI-dependent link in flow (c). A small node watcher that turns a `prompts.jsonl` append into a board card closes the only manual hop in dictation logging.
6. **Naming/syntax guards already exist as hooks** — lower priority; they already run automatically. Worth only a mention: extend `naming-guard.mjs` to also cover page/task slugs, not just CSS classes.

## Harness

| Flow | Survives OpenRouter (same CLI) | Survives opencode (skills/hooks likely don't load) |
|---|---|---|
| (a) task creation via `spawn_agent`'s `task` param | yes (node-side) | yes (node-side) |
| (a) task creation via `new-task` skill | yes | **breaks** — no skill loads, no launch line, no transcript |
| (b) prompt transcript + assistant relay | yes (hook) | **breaks** — `UserPromptSubmit` hook is a Claude Code feature |
| (b) becoming "the assistant" | yes | **breaks** — depends on loading a skill |
| (c) dictation → prompts.jsonl | yes (Dictate.js + Server rpc, no CLI involved) | yes |
| (c) prompts.jsonl → card | yes/no equally — already AI-dependent either way | same |
| Servex MCP tools (spawn/card/claim/etc.) | yes, if the harness can hold an MCP connection | depends entirely on whether opencode speaks MCP to Servex — unverified |

## Findings

1. The system already leans node for anything that must never be forgotten (append, hold-guard, syntax-guard) and leans skill for anything that needs judgment (what to log, when to load layout) — the split is basically right, but the two node examples above (task creation via `spawn_agent.task`, dev-server logs) show the pattern already works and should be pushed further.
2. Every real failure this audit found traces to the SAME shape: an AI step whose omission is invisible until someone reads the dashboard later (missing `session_id`, missing `--paths`, `landed_at` in the wrong file) — those are exactly the steps worth converting to a node tool that refuses the bad call outright, rather than a skill that just asks nicely.
3. A harness switch away from Claude Code (opencode, or any non-hook host) silently drops the prompt-relay hook and every skill-only step — before trusting a Servex-spawned agent on a different harness, someone should verify MCP still reaches it, because right now that is the one thing this whole tool inventory depends on.
