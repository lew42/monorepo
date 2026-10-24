# What every agent reads, the roles, and a readme audit (proposal, 2026-10-22)

The owner's ask: rules get lost because nobody is sure which files each agent reads. Measured below; the moves are proposals until the owner says go (CLAUDE.md is "ask first").

**Built 2026-10-22 on branch `task/readme-roles`** (the owner said build it; the merge is theirs): ✅ CLAUDE.md 3,763 → 1,319 words, framework rules in [the framework readme](../../readme.md) + [doc/rules.md](../../doc/rules.md), safety and cost long form in [agent-rules.md](agent-rules.md) · ✅ six role readmes, [Servex/agents/roles/readme.md](../../../../Servex/agents/roles/readme.md), `readme:` in `roles.js` · ✅ ai readme 1,510 → 660 words, records in [records.md](records.md) · every move mapped in [moves.md](../sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/moves.md). Open: ⬜ trim each role readme toward 400 words (moved whole, 689–5,271 today) · ⬜ the readme chain gives `public/framework/readme.md` only to agents whose folder is under it; a Servex/ or Server/ folder misses it · ⬜ the readme audit below.

**The documentation rule** (where docs go, what goes in them, who writes them) is section 4 of the `documentation` skill ([.claude/skills/documentation/SKILL.md](../../../../.claude/skills/documentation/SKILL.md)): `readme.md` is the index, a sibling `<topic>.md` holds an often-read topic, `doc/` holds the rest; no dated logs in readmes; edit, don't transcribe; the mastermind owns its area's docs. This page below is the dated record of how the readme system was planned.

## What is read today, and when

| File | Lines | Words | Read by |
|---|---|---|---|
| `CLAUDE.md` | 124 | 3,764 | every Claude Code agent, automatically (the SDK loads it), except the lean assistants (`setting_sources: []`) |
| [framework readme](../../readme.md) | 71 | 826 | the module index; only by masterminds that follow CLAUDE.md's "read it", and by the readme chain |
| [ai readme](../readme.md) | 87 | 1,488 | the readme chain (whole, since 2026-10-22) |

**The readme chain** (`Servex/agents/readme-chain.js`): a fresh Servex spawn gets the readme of every folder from the repo root down to its task dir, each given whole since 2026-10-22 (before: cut at 40 lines or `## More`, 3,000 tokens in all, which dropped the ai readme for most task agents). Cap now about 12,000 tokens; a readme over it is named so the agent opens it. A VS Code tab gets none of it: only CLAUDE.md.

**Lines undercount:** a paragraph is one line, so a "124-line" CLAUDE.md is about 5,000 tokens. Words are the honest measure; aim for a readme under about 800 words.

## The roles (`Servex/agents/roles.js`), last 7 days

| Role | Model | Job | Sessions | Spend |
|---|---|---|---|---|
| mastermind | Opus | decides, splits work, spawns, reviews | 55 | $352 |
| helper | Sonnet | a mastermind's builder for one part | 79 | $199 |
| minion | Haiku/Sonnet | one narrow job: a scan, a fix | 96 | $53 |
| task-mastermind | Sonnet | runs one task and its minions | 13 | $44 |
| reviewer | Sonnet | reviews a change before merge | 68 | $43 |
| clarity | Sonnet | checks a landed task's words are clear | 161 | $28 |
| session-smart, voice-assistant, assistant | Sonnet/Haiku | voice: the smart and fast assistants | 99 | $13 |
| fixer | Sonnet | the quick-fix pool | 15 | $3 |
| VS Code tabs | Fable/Opus | the owner's own sessions | 2 | $810 |

Each role names a skill in `roles.js`. The owner prefers a readme to a skill: the role is one switch, and the agent reads the readme for its role.

## Proposal

1. **One role readme each**, `Servex/agents/roles/<role>.md` (the skill text moves there; the skill becomes a one-line pointer), under 400 words, linked from one index.
2. **The framework readme is mandatory reading.** Framework rules (code style, classes, pages, traps) move from CLAUDE.md into `public/framework/readme.md` or the doc it links; CLAUDE.md keeps the laws, safety and "read the framework readme, then your role's readme". Target: CLAUDE.md under 1,500 words.
3. **Short readmes, read whole.** The chain now gives each readme whole, so a readme's length is paid by every agent below it: index first, records tables moved to a `doc/` file, about 800 words at most.
4. **`ai/priority.md`** is read by every mastermind before it spawns (done 2026-10-22).

## A readme audit, on the prompt-audit pattern

- **Pass 1 is built.** A script computes what it can per readme (words, files, unnamed entries, dead links, orphan, `docs/` folder, dated lines, crowded); Haiku, one call per readme given its text and its folder's file names (never the code), judges only `shape` (index, essay, log, mixed), up to 3 `history` lines and one `note`. One line per readme in [`ai/readmes/audit.jsonl`](/framework/ai/readmes/readme.md), `{readme_audit: {v, path, sha, words, files, unnamed, dead_links, orphan, docs_folder, dated_lines, crowded, shape, history, note}}`, append-only, latest line per path wins, a rerun skips an unchanged `sha`. Run: `node Server/ReadmeAudit.mjs --computed` (free, one second), `--haiku --limit N` (the N worst first), `--path <readme>`; the Readmes page shows it. Measured: about $0.05 a readme (not $0.02), so the whole walk is about $20 and a $6 cap judged the 166 worst.
- **Pass 2, Sonnet, one per top-level system** (Servex, Server, core, ext, ux, ai): reads the pass-1 lines and checks the code where a finding needs it; proposes fixes as `{readme_fix: {path, line, change, why}}`. Fixes are applied in a separate step, after review.
- **Cost:** pass 2 about $3.
- **Code:** `Server/ReadmeAudit.mjs` (`class ReadmeAudit`), the Haiku call is `Servex/ext/refine/RefineCall.js`, as in `PromptAudit`.

## The owner's direction (2026-10-22, tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl`)

- **Read whole readmes; no `## More` sections.** A readme that needs one needs better organization instead: link the major chunks, and split a big module into submodules or folders. The 12,000-token chain cap is a guess (four times the old 3,000), not measured: measure the real chain size per folder before keeping it.
- **What gets injected must be visible.** A readme page: type a path, see every readme an agent there gets, what is in each, and its tokens, in layers (the chain; then each readme it links; then theirs), with the total under any module. The session page shows which readmes each session was given and read, and what share of its context they took (system prompt, CLAUDE.md, readmes).
- **The spawner prescribes readmes.** Node injects the chain from the root to the working folder for every agent; the mastermind that spawns an agent names the extra sub-readmes it should read. The agent may read more. This replaces per-role readme lists. A mastermind reads most readmes in its area at startup and fixes anything badly out of place first.
- **`improvements.md` per folder**: any agent can propose an improvement there (linked from the folder's readme); a mastermind reads it at startup and does a fix that has been proposed more than once, quickly, when it helps the task.
- **Reads are logged by node, not by memory**: reading a readme through a tool writes it to the session log, as do spawns and skill/role loads. One generic `log` tool with a kind string and arbitrary data, not one tool per kind.
- **Fewer tools.** About 90 MCP tools today; one `item` tool with a method name and data (an RPC), as proposed in past work. On the server, the tool could instantiate the item, apply the delta and save through its store, so the same validation runs as in the browser.
- **CLAUDE.md holds only what is Claude-specific;** the framework must not be locked into Claude. Everything else moves to the framework readme. Maybe CLAUDE.md becomes "read `public/framework/readme.md`".
- **Fixed sequences are code, not reminders.** Hooks may inject a short reminder before a tool runs, but a required sequence of steps belongs in a loop or a tool.
- **A session completes only when all its tasks are done, and the merge is one of its tasks** (the owner approves it; [priority.md](../priority.md) 3b).
- ⬜ **A systems audit**: module by module, as a whole system: what it is, whether it is useful, whether to move, rename or merge it; prune obvious or stale lines. Slow and systematic, aiming for clarity, not churn. Every system indexed so nothing is ever unfindable.

## Maps and the plan for the direction above (2026-10-22)

- ✅ [agent-context.md](agent-context.md): every role and start, what it loads, what is logged, whether a hook can inject text.
- ✅ [Servex/doc/tools-map.md](/Servex/doc/tools-map.md): every tool, and a compacted set. ✅ [core/Item/doc/map.md](/framework/core/Item/doc/map.md): the item system.
- ✅ [The plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/agent-context/plan.md): ten slices, measured chain sizes (median 5,129 tokens, max 10,420; the 12,000 cap never fires).

### Follow-up (the owner, 2026-10-22, same log)

- **No role per system.** Retire `servex-mastermind`: what is useful to every manager goes into the mastermind role readme; what is about Servex goes into `Servex/readme.md`. A mastermind working on Servex just reads Servex's readmes deeper. Directories hold the documentation, not roles.
- **The mastermind plans in the task system, visibly.** For each request: name the session, its projects and their tasks (child tasks via the `item` tool, a planning step before building), the agents and the estimated cost, and use those same names in chat and on the site so the owner learns them. Parallel work is the mastermind's call: separate folders of one worktree when the work cannot conflict, separate worktrees when it can. Running the plan should be node's job (spawn in order, respect `after` edges, chase, close), not the agent's memory.
- **No sentence-by-sentence move ledgers.** Git history records moves; a move needs only a short summary of what went where. (`readme-roles/moves.md`, 325 lines, was asked for in its brief; not repeated.)

### Follow-up 2 (the owner, 2026-10-22, same log)

- **The shape, to approve before any surgery:** all front-end AI code lives in `public/framework/ai/`; the server side lives in `Servex/`, with its AI part (the SDK, its sessions, which are Claude SDK sessions) maybe gathered in a `Servex/ai/`-like folder. Follow the code's structure so where things live is obvious. The system architect proposes the shape; the owner approves it.
- **Probe results go where the code lives:** SDK facts in [Servex/agents/doc/sdk.md](../../../../Servex/agents/doc/sdk.md); front-end facts under `ai/`.
- **Improvements:** a mastermind's readme sanity check proposes moves and fixes as improvements (`improvements.md` per folder, rule in the mastermind role readme), written through the `item` tool rather than a new tool.
- **Item tool vs raw log.** An `item` call should mean: instantiate the item, then apply a delta or call a method. Until items are instantiated server side, a plainly named raw log (append a line to a named file) may stand in, with node adding the time, author and checks. Never make the model write the JSON bookkeeping.
- **Markdown vs JSONL.** Markdown is unstructured and renders on the site only through the `.md` route, without live widgets; JSONL is structured, so the site can render, filter and search it. Lean on JSONL logs (through the item tool) for records; markdown for prose.
- ⬜ **Open question:** when an agent is told to read a readme or doc, should it also follow (tail) that file, so later edits reach it?
- **Answered by the system architect (2026-10-22):** the shape, item vs log, markdown vs JSONL and the tail question are in [code-shape.md](code-shape.md) (a proposal for the owner to approve; nothing moved). The improvements rule is in [the mastermind role readme](/Servex/agents/roles/mastermind.md), written through the item tool to each folder's improvements list.
- **Improvements are JSONL, not markdown** (same day, later): one `improvements.jsonl` per folder, one line per suggestion, written by the `item` tool; a suggestion made again adds weight instead of a duplicate line, and the site renders, filters and ranks them per improvement. Same store as sessions and tasks.
