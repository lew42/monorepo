# AI system map — what exists, what starts what, which skills are used (2026-10-15)

A factual map of the agent system, read from the code and the logs on 2026-10-15; no recommendations. Every number on this page was computed by a script in [scripts/](scripts/), and its raw output sits beside this file.

## On one screen

- **One process runs every agent: [Servex](/framework/servex/)** (`node Servex/sustain.mjs`). It has spawned **2,879 distinct agent ids** since 2026-09-22. Most were minions (998), clarity checkers (607), reviewers (441) and task masterminds (331) ([spawns.txt](spawns.txt)).
- **Three things start agents: code, hooks and other agents.** Code: the Dispatcher, the voice Sessions, the Layers and Global classes, and RemoteMCP. Hooks: `ledger.mjs` sees a landing → `on-landing.mjs` → clarity, owner-check, Council. Agents: the `spawn_agent` tool. Two timers chase work that stalls: **Heartbeat** (status check after 5 min of silence) and **TaskLoop** (every 5 min: tasks quiet for 10+ min, step nudges, a daily FollowUp).
- **Skills: 33 in the repo.** By a fixed rule (loaded in the last 7 days = working; nothing in 14 days = stale; 8–14 days = unverifiable), **20 are working, 7 unverifiable, 6 stale**. Three were never loaded in any log: `make`, `log-assistant` and `fork-claude-session`. Since 2026-10-12, Servex pastes role skills straight into the first message, so those loads appear in `skills.jsonl`, not as Skill-tool calls.
- **Docs: 1,772 file paths named in 66 system docs were checked. 107 were not found** (46 missing, 35 moved, 26 names in no tracked file). **13 claims about behaviour were checked by hand: the code contradicts 12, and the 13th leaves out two of the three logs** (table 4b). Examples: the hooks readme says `hold-guard` `record()` is not wired, but `ledger.mjs:158` calls it; it says prompts are logged to `.claude/prompts/<day>.jsonl`, but that log was retired on 2026-10-02.
- **Limits.** Transcripts are kept from 2026-09-01 on, and the ledger hook's lines from 2026-08-17. Registry counts are distinct ids, so a re-used id counts once. "Working" means "was loaded", not "did its job well".

---

## 1. Systems that exist

| System | Path | One line | Entry point |
|---|---|---|---|
| Servex | `Servex/Servex.js` | Always-on process: agents, dev servers, logs, MCP door, proxy :80 | `node Servex/sustain.mjs` |
| Agents host | `Servex/agents/Agents.js` | Holds every SDK session; spawn/send/stop/revive; working cap 5 (`:586`) | MCP `spawn_agent` (`tools.js:310`) |
| Roles | `Servex/agents/roles.js` | Role → skill(s), model tier, effort, permissions; inlines SKILL.md text (`opening()` `:135`) | read by `Agents.js:180` |
| Readme chain | `Servex/agents/readme-chain.js` | Prepends root→dir readmes to a fresh dir-bound agent's first message | `Agents.js:185` |
| Dispatcher | `Servex/agents/Dispatcher.js` | A `route:"task"` prompt line → spawns a `task-mastermind`; `max: Infinity` (`:33`) | `Servex.js:223` |
| Assistant (assistant-fast) | `Servex/agents/Assistant.js` | Lobby agent for spoken words with no card | `Servex.js:204` |
| Layers + Global | `Servex/agents/Layers.js`, `Global.js` | Card assistant/manager per card; master-assistant + mastermind-servex across all | `Servex.js:283-284` (off with `SERVEX_NO_LAYERS`) |
| Voice Sessions | `Servex/agents/Sessions.js` | One ✦ press = a session-fast + session-smart pair | `Servex.js:285` |
| RemoteMCP | `Servex/ext/remote/RemoteMCP.js` | claude.ai voice connector (`ask_mastermind`) → `mastermind voice-*` agent | `Servex.js:303` |
| Echo | `Servex/agents/Echo.js` | Prompt-refinement agent listening on the prompts log | `Servex.js:217` |
| Pool + Fixer | `Servex/Pool.js`, `agents/Fixer.js` | Warm quick-fix worktree; `fixer-1` agent takes `quick_fix` requests | `Servex.js:290, 299` |
| Experts | `Servex/agents/Experts.js` | Per-module expert checkpoints (`ask_expert`, `load_module`) | MCP tools |
| Directory mastermind | `Servex/agents/directory.js` | `ask_directory` → fresh mastermind for one folder | MCP `ask_directory` |
| Module inbox | `Servex/agents/ModuleInbox.js` | An ask's essence appended to a module's `inbox.jsonl` | MCP `module_inbox` |
| TaskLoop | `Servex/TaskLoop.js` | Every 5 min: chase quiet tasks, step nudges, daily FollowUp, worktree sweep | `Servex.js:260` |
| Heartbeat | `Servex/Heartbeat.js` | Silent-agent status check → triage → revive → escalate; task budgets | `Servex.js:273` |
| Lifecycle | `Servex/Lifecycle.js` | Closes everything a landed task owns (`reap()` `:321`) | called by `on-landing.mjs` |
| Monitor / Processes / LogSweeper / Usage / Worktrees | `Servex/*.js` | RAM/CPU gate, process census, log rotation, `ai/usage.json` refresh, worktree upkeep | `Servex.js:232-276` |
| Hooks | `.claude/hooks/`, `.claude/settings.json` | 11 scripts in 17 hook entries across 6 events (table 2b) | Claude Code harness |
| Landing chain | `Server/on-landing.mjs` | Text/doc/card checks, layout-check, clarity, Council, owner-check, worktree sweep | spawned by `ledger.mjs:246` |
| Clarity | `Server/clarity.mjs` | Spawns a `clarity` agent per landing / proposal | `on-landing.mjs:46`, `ledger.mjs:203` |
| Review + merge gate | `Server/review.mjs`, `Server/merge.mjs` | Spawns `reviewer`; merge refuses an un-reviewed branch (`merge.mjs:210`) | `node Server/merge.mjs` |
| Owner-check | `Server/owner-check.mjs` | Reviewer checks a landing against the owner's own words | `on-landing.mjs:113` |
| Council | `Server/Council.mjs` | Feedback council; runs when ≥10 landings or ≥24 h + ≥1 (`:278`) | `on-landing.mjs:48` |
| Task folders | `Server/TaskDirs.mjs` | Creates `ai/sessions/YYYY/MM/DD/<session>/<task>/` | `new-task` skill |
| Step runner | `Server/Steps.mjs` | A task's steps; next-step text and 2× nudge | `TaskLoop.js:205`, `step-prompt.mjs:28` |
| Refine queue | `Server/RefineQueue.mjs` | Owner prompts → refined cards, one Haiku call each | **manual CLI only**: no code caller found |
| Session index / FollowUp / PastWork | `Server/SessionIndex.mjs`, `FollowUp.mjs`, `PastWork.mjs` | Queryable sessions/tasks; daily "fell through" report; past-work search | `TaskLoop.js:107` (FollowUp); others manual |
| Skills | `.claude/skills/` | 33 SKILL.md; census `node Server/SkillCensus.mjs` | Skill tool or role inline |

---

## 2. Who spawns what, what triggers what

### 2a. Agent spawns (code → role), with lifetime counts from Servex's `registry.json`

| Trigger | Spawns role | Site | Ever (ids) | Last |
|---|---|---|--:|---|
| any agent / VS Code via MCP `spawn_agent` | any (mostly `minion`) | `tools.js:310` | minion 998 | 10-15 |
| ledger sees a landing → on-landing → clarity.mjs; ledger sees a brief/todo write → clarity.mjs | `clarity` | `ledger.mjs:246` → `on-landing.mjs:46` → `clarity.mjs:74`; `ledger.mjs:203` | 607 | 10-15 |
| `merge.mjs` / manual review; on-landing owner-check | `reviewer` | `review.mjs:442, 777`; `owner-check.mjs:232` | 441 | 10-15 |
| Dispatcher: a `route:"task"` prompt line | `task-mastermind` | `Dispatcher.js:127` | 331 (all sources) | 10-15 |
| Global: daily / on boot | `mastermind` (servex), `master-assistant` | `Global.js:205`, `:166` | 107 / 2 | 10-15 |
| claude.ai voice `ask_mastermind` | `mastermind` (`voice-*`) | `RemoteMCP.js:133` | (in the 107) | 10-15 |
| Echo listening on prompts log | `echo` | `Echo.js:180` | 125 | **10-08** |
| ✦ voice session | `session-fast`, `session-smart` | `Sessions.js:1037, 1048, 1055` | 43 / 43 | 10-14 |
| Layers: a card | `card-assistant`, `card-manager` | `Layers.js:637, 648, 701` | 29 / 13 | **10-06 / 09-30** |
| Assistant: help request | `helper` | `Assistant.js:294` | 66 | 10-15 |
| `ask_directory` | `directory-mastermind` | `directory.js:198` | 8 | **10-05** |
| `ask_expert` / `load_module` | `expert`, `expert-ask` | `Experts.js:277, 298` | 1 / 1 | **09-29** |
| `quick_fix` | `fixer` | `Fixer.js:67` | 1 | 10-15 |
| no current caller found (only `Servex.js:1090` and `roles.js:89-90` name them) | `checker`, `voter` | — | 28 / 21 | **09-28** |

### 2b. Hooks (`.claude/settings.json`)

| Event | Matcher | Script | What it does |
|---|---|---|---|
| PreToolUse | Bash\|PowerShell | `junction-guard`, `git-guard`, `jsonl-guard`, `server-guard` | Block dangerous junction ops, destructive git in main, shell writes to `.jsonl`, hand-started dev servers |
| PreToolUse | Write\|Edit\|MultiEdit\|NotebookEdit | `jsonl-guard`, `auto-hold` | Block raw `.jsonl` writes; take/renew a short reload hold on site files |
| SessionStart | all / `resume` | `session-page.mjs` / `ledger.mjs session-start` | Tell a tab its own page; log "session resumed" |
| PostToolUse | Edit\|Write\|NotebookEdit | `ledger.mjs` | First-touch `action` line; runs syntax/health/hold/naming guards (`ledger.mjs:195-198`); proposal → clarity (`:203`) |
| PostToolUse | Skill | `ledger.mjs` | `{"log":{"msg":"skill: X"}}` into the session's task.jsonl |
| PostToolUse | Bash | `ledger.mjs`, `step-prompt.mjs` | hold-guard `record()` (`ledger.mjs:158`); next step's text as context |
| Stop | — | `ledger.mjs stop` | Blocks only if `landed_at` has no outcome (`:233`) or steps remain unfinished (`:248`); spawns on-landing (`:246`) |
| Stop | — | `reply-relay.mjs` | Logs the assistant's reply to the session page |
| Stop | — | `AISessionAudit.mjs --append-stdin` | Independent cost recompute of the session |
| SessionEnd | — | `ledger.mjs session-end` | "session ended without landing" line |
| UserPromptSubmit | — | `prompt-relay.mjs` | Prompt → the session's own `page.jsonl`; relays to mastermind/board only for an "assistant"-marked session |

### 2c. Timers

| Timer | Interval | What it does | Site |
|---|---|---|---|
| TaskLoop tick | 5 min (`SERVEX_TASKLOOP_EVERY_MIN`) | Task quiet ≥10 min → `agents.send` wake; step >2× estimate → nudge; once a day `FollowUp.mjs --write`; worktree sweep | `TaskLoop.js:32-33, 44, 60, 107, 192, 205` |
| Heartbeat | min(60 s, silent/3); boot sweep at 3 s | Agent silent 5 min → status check; revive (cap 2/h, 5/day) → escalate | `Heartbeat.js:24, 58-60, 134, 215, 241` |
| Pool sweep | 10 min | Heal quick-fix worktree | `Pool.js:56` |
| Sessions sweep | ≤60 s | Recycle idle voice pairs | `Sessions.js:242` |
| Monitor / LogSweeper | own `every` | RAM/CPU gate, log rotation | `Monitor.js:65`, `LogSweeper.js:55` |

---

## 3. Skills — real use

Sources: **transcripts** (Skill tool calls and typed `/slash` commands; 9,952 files, 7.7 GB, deduped by tool_use id; history starts 2026-09-01), **ledger hook** lines (`skill: X` in 1,603 task.jsonl files, from 2026-08-17), **Servex inlined** (`skills.jsonl`, 573 spawns since 2026-10-12, 8 fell back to "Load the…"). Status rule: working = a load in the last 7 days; unverifiable = last load 8–14 days ago; stale = none in 14 days. Full JSON: [skill-table.json](skill-table.json).

| skill | transcript calls (sessions) | ledger hook lines | Servex inlined | role row | last used | SKILL.md last commit | status |
|---|--:|--:|--:|---|---|---|---|
| minion | 1149 (1023) | 100 | 93 | minion | 2026-10-15 | 2026-10-13 | working |
| finish-task | 645 (360) | 566 | 0 |  | 2026-10-14 | 2026-10-13 | working |
| clarity | 609 (608) | 0 | 172 | clarity | 2026-10-15 | 2026-10-14 | working |
| documentation | 271 (122) | 283 | 0 |  | 2026-10-08 | 2026-10-14 | working |
| new-task | 452 (184) | 26 | 0 |  | 2026-10-06 | 2026-10-13 | unverifiable |
| code | 315 (176) | 130 | 0 |  | 2026-10-12 | 2026-10-13 | working |
| sub-mastermind | 245 (243) | 50 | 149 | task-, page-, directory-mastermind | 2026-10-15 | 2026-10-14 | working |
| content | 397 (397) | 3 | 0 |  | 2026-10-15 | 2026-10-09 | working |
| page | 179 (177) | 56 | 149 | task-, page-, directory-mastermind | 2026-10-15 | 2026-10-13 | working |
| css | 193 (91) | 116 | 0 |  | 2026-10-12 | 2026-09-30 | working |
| check-claude-usage | 153 (98) | 105 | 0 |  | 2026-10-12 | 2026-10-15 | working |
| layout | 147 (61) | 95 | 0 |  | 2026-10-12 | 2026-10-12 | working |
| ui-test | 119 (23) | 65 | 0 |  | 2026-10-14 | 2026-10-14 | working |
| mastermind | 170 (12) — 159 typed `/mastermind` | 0 | 0 |  | 2026-10-15 | 2026-10-14 | working |
| new-css-class | 92 (34) | 72 | 0 |  | 2026-10-02 | 2026-09-30 | unverifiable |
| servex-mastermind | 50 (50) | 28 | 57 | mastermind | 2026-10-15 | 2026-10-14 | working |
| skill-improvement | 75 (29) | 52 | 0 |  | 2026-10-03 | 2026-10-13 | unverifiable |
| review | 8 (8) | 4 | 94 | reviewer, checker | 2026-10-14 | 2026-10-14 | working |
| research | 15 (7) | 5 | 0 | voter | 2026-09-30 | 2026-09-29 | stale |
| every-prompt | 11 (3) | 0 | 0 | assistant, page-assistant | 2026-09-29 | 2026-10-09 | stale |
| system-architect | 4 (4) | 4 | 0 |  | 2026-10-15 | 2026-10-13 | working |
| auditor | 4 (4) | 1 | 0 |  | 2026-10-03 | 2026-10-13 | unverifiable |
| decide | 3 (3) | 2 | 0 |  | 2026-10-08 | 2026-10-14 | working |
| openrouter | 4 (4) | 0 | 0 |  | 2026-10-06 | 2026-10-07 | unverifiable |
| ui | 4 (4) | 0 | 0 |  | 2026-10-12 | 2026-09-30 | working |
| color | 3 (3) | 0 | 0 |  | 2026-10-02 | 2026-09-30 | unverifiable |
| navigation | 2 (2) | 1 | 0 |  | 2026-10-05 | 2026-09-30 | unverifiable |
| past-work | 2 (2) | 1 | 0 |  | 2026-10-12 | 2026-10-12 | working |
| voice-mastermind | 1 (1) | 1 | 0 |  | 2026-10-15 | 2026-10-15 | working |
| master-assistant | 1 (1) | 0 | 0 | master-assistant | 2026-09-19 | 2026-10-09 | stale |
| fork-claude-session | 0 | 0 | 0 |  | never | 2026-10-13 | stale |
| log-assistant | 0 | 0 | 0 | log-assistant | never | 2026-10-12 | stale |
| make | 0 | 0 | 0 |  | never | 2026-10-13 | stale |

Notes, computed:
- Skills called that are **not** in `.claude/skills/`: `new-page` 128 (archived; last 10-08), `fans` 44 (user-level skill), `figma:figma-use` 29 + `figma-use` 7, `claude-api` 6, `dataviz` 3, `naming` 2 (archived), `assistant` 2 typed (archived). Raw: [skill-calls.txt](skill-calls.txt).
- The ledger hook logs a Skill call only while a task is open. Its `minion` lines stop on 2026-10-04, but transcripts show `minion` calls until 2026-10-12, and Servex pastes the minion skill into the first message from 2026-10-12 on.
- `every-prompt`'s role rows (`assistant`, `page-assistant`) exist, but the assistant layers use `Servex/agents/*.md` prompts with their own fields (`Assistant.js:80`, `Layers.js:637`), and `skills.jsonl` shows 0 inlines.

---

## 4. Doc claims the code does not back (prune candidates)

### 4a. Paths (computed: [doc-paths.txt](doc-paths.txt), all 107)

Excluding `handover.md` (40, mostly retired `ai/<date>/` paths) and runtime files outside the repo (Servex logs in `%LOCALAPPDATA%`):

| Doc:line | Names | Found |
|---|---|---|
| `CLAUDE.md:6` | `public/framework/ai/2026-10-12/claude-md-consolidate/` | at `ai/sessions/2026/10/12/session-3b391f22/claude-md-consolidate` |
| `CLAUDE.md:46` | `/framework/ai/readmes/` | no such folder |
| `public/framework/ai/systems-map.md:18` | `/framework/ai/skills/` | no such folder |
| `Servex/agents/readme.md:98` | `tiers-design/doc/tools.md` | under `ai/sessions/2026/09/22/tiers-design/…` |
| `Servex/doc/skills.md:3` | `skill-reliability/MissSample.mjs` | under `ai/sessions/2026/10/12/session-78fdc37f/…` |
| `Servex/doc/steps.md:15` | `step-runner/requirements.md` | under `ai/sessions/2026/10/12/session-87bec773/…` |
| `Servex/doc/budget.md:24` | `…/node-reliability/budget-proof.txt` | missing |
| `Servex/doc/inbox.md:3, 58` | `/framework/ext/drawer/doc/inbox/`, `/framework/core/Page/jsonl/md/doc/writers/` | missing |
| `Servex/doc/pool.md:116` | `../never-lose-a-wake.md` | missing (file is `Servex/doc/never-lose-a-wake.md`) |
| `Servex/doc/echo.md:18` | `/framework/ai/2026/10/07/session-87bec773/` | missing |
| `Server/README.md:27, 38, 66` | `/framework/ai2/2026-09-28/…` | moved to `ai/archive/task-stubs/` or `ai/sessions/2026/09/28/` |
| `.claude/skills/documentation/SKILL.md:38-80` | `./child/`, `./name/`, `./doc/focus.md`, `./doc/generator.md`, `/module/files/` | example paths; only `ext/Panel/doc/*` exist |
| `.claude/skills/mastermind/SKILL.md:38` | `tiers-design/doc/roles.md` | under `ai/sessions/2026/09/22/…` |
| `.claude/skills/sub-mastermind/SKILL.md:65` | `collab/tally.md` | under `ai/sessions/2026/09/28/…/collab-rounds/` |

### 4b. Behaviour (checked by hand, code cited)

| Claim | Doc | What the code shows |
|---|---|---|
| hold-guard's `record()` needs a new PostToolUse Bash hook "this repo does not have yet"; until then it is never called | `.claude/hooks/readme.md` (hold-guard section) | `settings.json` wires `ledger.mjs` on PostToolUse Bash, and `ledger.mjs:158` calls `hold-guard.record()` |
| Every prompt is appended to `.claude/prompts/<day>.jsonl` | `.claude/hooks/readme.md` (prompt-relay) | `prompt-relay.mjs:19-20` says that file is retired, and writes to the session's own `page.jsonl`. The newest `.claude/prompts/` file is `2026-10-02.jsonl` |
| Council gathers the owner's words from `.claude/prompts/<day>.jsonl` | `Server/Council.mjs:3` header | that source stopped on 2026-10-02 (see above) |
| The relay branch fires once a session loads the `assistant` skill | `.claude/hooks/readme.md` | `assistant` is in `.claude/skills-archive/`; transcripts show 0 Skill-tool loads of it, and 2 typed `/assistant` (both 2026-09-19) |
| The hooks readme documents the hooks | `.claude/hooks/readme.md` | `session-page`, `step-prompt`, `auto-hold`, `reply-relay`, `junction-guard`, `naming-guard` and the `AISessionAudit` Stop hook are wired or imported but get no mention; the ledger table leaves out its PostToolUse Bash wiring |
| `log-assistant` and `master-assistant` are "not in any role row"; "voters and checkers have no row" | `Servex/doc/skills.md` | `roles.js:70` (`master-assistant`), `:89` (`checker` → review), `:90` (`voter` → research), `:91` (`log-assistant`) |
| Dispatcher: "At most two run at once" | `Servex/agents/readme.md` (Dispatcher) | `Dispatcher.js:33` has `max: Infinity`, and the file's own comment `:11` says "no cap by default" |
| Section "Tools are node functions, not HTTP" | `Servex/agents/readme.md` | the paragraph under it says spawned agents get tools over HTTP (`/mcp?as=<id>`); in-process only for tests |
| Masterminds read `ai/usage.json`; "Servex injects it" | `CLAUDE.md` (Cost and roles) | `Servex/Usage.js:44-63` refreshes the file, but no code path was found that puts it into an agent's prompt (`grep usage.json Servex/agents` = none) |
| A quiet agent is chased by `TaskLoop` (~5 min cadence) | `CLAUDE.md` (Memory) | TaskLoop wakes a task after **10** quiet minutes (`TaskLoop.js:33`); the 5-minute check is the Heartbeat's (`Heartbeat.js:24`) |
| Pages are checked at 400, 1200, 1920, 3440 before they land | `CLAUDE.md` (Pages) | Those widths are used only with `--bands` (`layout-check.mjs:47`, which `review.mjs:740` passes). The landing check calls it without `--bands`, so it uses 1280/1920/2560/3440 (`on-landing.mjs:173`), and `merge.mjs:521` checks new pages at 1920 only |
| "the Stop hook will nag until [finish-task] runs" | `finish-task` SKILL.md description | `ledger.mjs` Stop blocks only on `landed_at` with no outcome (`:233`) or unfinished `steps` (`:248`). A task with neither is never blocked |
| `skill-usage.mjs` and `SkillCensus.mjs` count loads | `system-architect` SKILL.md | true, but both read only task.jsonl `skill:` lines; neither reads transcripts or `skills.jsonl` (see section 3 for all three) |

---

Scripts (re-run from the repo root): `scripts/skill-calls.mjs --out skill-calls.json` · `scripts/skill-logs.mjs --out skill-logs.json` · `scripts/spawns.mjs --out spawns.json` · `scripts/doc-paths.mjs --out doc-paths.json` · `scripts/skill-table.mjs <this dir>`. Brief: [ask-8c18b60c.md](../ask-8c18b60c.md), item A.
