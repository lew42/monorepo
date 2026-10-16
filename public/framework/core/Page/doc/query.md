# page/query: finding past work (what exists, what is stale, what to do)

**Anchor:** this doc lives under `core/Page` because a generic "ask the system for rows" thing has no better home yet (the owner, 2026-10-16: "page/query"). Written 2026-10-16 by a discovery round, facts counted by script (`past-work/` task beside the voice session). Nothing was built; one cheap pilot was run.

## On one screen

- **The query already exists and is live.** `Server/SessionIndex.mjs` holds one row per `task.jsonl` in memory, `fs.watch` keeps it current, and it answers filters in plain JavaScript. It is also ext/Query's `tasks` source. No page asks it yet.
- **The tags are the weak part.** Module tags come from the files a task edited (`action.files`). The pilot shows that is thin: a whole day of core/Page, ext/Refine and Servex work was tagged just `ai`. The owner's own words are where the topics are.
- **Three stale snapshots, one hand-run index and an unused prompts log are the dead weight.** Verdicts below.
- **Raw owner words from the Claude app voice session never reach disk** (only a paraphrase does). Proposal in section 6, one small change.
- **One Haiku minion cost $1.04** on a 148 KB log because its context hit 117k tokens, over the 100k line. Preprocess first (section 5).

## 1. Task, folder, session: the rule, checked

The owner's rule: the top folder is the top agent's task, whatever its role; each subfolder is a task given to a spawned child, any role; a session is one Claude conversation, and line 1 of a `task.jsonl` names the session doing the work. Counted over all 1,628 `task.jsonl` files under `public/framework/ai/`:

| Claim | Count | Verdict |
|---|---|---|
| A folder with a `task.jsonl` is a task | 1,628 files (1,627 in `sessions/YYYY/MM/DD/`, 1 `quick-fix`) | holds |
| Line 1 is an `assign` line | 1,594 (98%) | holds |
| Line 1 names a `session_id` | 1,512 (93%) | holds; 116 have none (old or hand-made) |
| Top folder = top task | 1,127 folders have no task ancestor | holds |
| Subfolder = child task | 501 folders sit inside another task folder | holds |
| A child says so in `assign.parent_task` | 255 do; only 145 of those name the real parent folder | **partly**: 103 point at a folder path that moved (old `ai/2026-09-29/…` dates, the `audio/audio` double folder); 7 are top-level folders with a parent elsewhere |
| ...and the other nested folders | 253 nested folders have no `parent_task` at all | so the **folder nesting is the truth, `parent_task` is a helper** |
| Role | 94 `mastermind*` names, 295 `minion*`, 227 other names (`task-mastermind-…`, `helper-…`), 991 with no agent name (VS Code tabs) | the folder does not depend on role |
| One session, one task | 851 distinct sessions across 1,512 tasks; 59 sessions have more than one (one VS Code session wrote 148) | **a session is not a task**: a long session logs many tasks |
| The raw session exists | 762 of the 851 sessions have a transcript in `~/.claude/projects` on this machine (9,379 transcripts there in all) | the SDK file is the one copy of what was said |

**The plain definition, to keep:**
- **Task** = a folder with a `task.jsonl`. Where it lives is decided by `Server/TaskDirs.mjs` (`ai/sessions/YYYY/MM/DD/<session folder>/<slug>/`; a child task is `<parent>/<slug>/`).
- **Session** = one Claude conversation (a VS Code tab, a Servex agent, a CLI run). It has a uuid and a transcript. It owns one top task, and may log more.
- **Nesting** = by folder. `parent_task` repeats it in line 1 and goes stale when folders move; read the folder, not the field.

## 2. Coverage: what the tags can see

- `action.files` lines: **961 of 1,628** task logs have at least one, so file-based module tags exist for 59%.
- Owner prompt text in `chat` lines: only **14 task logs** have any chat, **4** with the owner's words (about 70,000 characters in all, nearly all in the voice sessions). Everywhere else the owner's prompts are in the SDK transcript, not the task log.
- `topics` on a task line: **7** logs. A summary line: **2**.
- `SessionIndex.module_of` maps everything under `public/framework/ai/` to the single tag `ai`, so any task whose edits were only its own log or brief gets `ai` and nothing else.
- Today's voice root `voice-20261016` has 2 action lines: its tags are thin, as expected.

## 3. Inventory: every piece that queries, indexes or audits past work

Dates are the last git commit (the snapshot JSON files are gitignored, so those are file times). Live = updated as work happens; snapshot = written once or by hand.

| Piece | What it does | Writer → reader | Last change | Kind |
|---|---|---|---|---|
| `Server/SessionIndex.mjs` ([doc](/Server/doc/session-index.md)) | every task.jsonl as one row (`modules`, `landed`, `text`), filters in JS | `fs.watch` on `ai/` → PastWork, FollowUp, ModuleLog, ext/Query `tasks` | 2026-10-13 | **live** |
| `ext/Query` (`Query.js`, `QueryClient.js`, `QueryServer.mjs`) | generic JSON query over in-memory sources via the dev socket | SessionIndex, AISessionTailer → Sessions page | 2026-10-13 | **live** |
| `Server/PastWork.mjs` | keyword search over tasks, asks, docs, commits; builds the index file | SessionIndex etc. → the `past-work` skill | 2026-10-13 | on-demand script |
| `ai/past-work-index.md` (96 KB, 277 topics, 1,090 landed tasks) | topic list built from `outcome` lines | `PastWork.mjs --index` (hand run) → people, the skill | 2026-10-14 | **snapshot**, rebuilt by hand |
| `Server/ModuleLog.mjs` | one path's history: tasks plus `git log`, graded | SessionIndex + LandingCheck → the skill | 2026-10-15 | on-demand script |
| `Server/Asked.mjs` | "didn't I ask for X?": ask date, outcome, decisions | asks-outcomes + PastWork → people | 2026-10-15 | on-demand script |
| `Server/AskTally.mjs` → `ai/doc/asks-outcomes.md` + `.jsonl` (68 KB) | every dictated prompt → asks → features → verdict | owner prompts (scratch) → Asked.mjs, the doc | 2026-10-13 | **snapshot** (316 features) |
| `Server/AskIndex.mjs` + `ext/Refine` queue | refined asks to a per-session `asks.jsonl` and module inboxes | `RefineQueue.mjs` (Haiku, one prompt per call) → module `refined-asks.md` | 2026-10-14 | live per new prompt; covers only 4 sessions so far |
| `ai/asks.jsonl` (279 lines) | owner asks routed to an owner agent, with status | Servex asks writer → AI board | 2026-10-15 | live append; **status only, no raw words** |
| `ai/prompts.jsonl` (4 lines) | the Servex `prompts` log: Dictate POSTs each finished sentence to `/log/prompts`, `Assistant.js` reads it | Dictate → Assistant | 2026-09-23 (file time 10-12) | **built for raw owner words, unused**: 4 test lines |
| `Server/session-summary.mjs` → `ai/sessions/session-index.json` (280 KB), `session-tree.json` (176 KB) | cost, tree and flags per Claude session for the grid | run by hand → `AISessionIndex.mjs`, Sessions page (spend columns) | file times 2026-10-08/09 | **snapshot, 2,707 sessions as of 10-09** |
| `ai/sessions/sessions.json` (324 KB) | the older list of Claude sessions | session-migrate scripts → `session-summary.mjs` (uses it only to pick which rows the grid file keeps) | file time 2026-10-08 | **snapshot**, old |
| `ai/sessions/task-manifest.json` (340 KB) | old path → new path of every moved task folder | `TaskDirs.mjs` mover → `TaskDirs.follow()/alias()` | 2026-10-10 | one-time record, still read |
| `ext/DataGrid` | the table / card-rail UI for any rows | Sessions page and others (display only, not a store) | 2026-10-14 | live UI |
| `Server/FollowUp.mjs`, `TaskState.mjs`, `LandingCheck.mjs`, `Audit.mjs` | what fell through the cracks, what is in flight, was the branch landed, audit consensus | task.jsonl / registry → `follow-up.md`, `tasks/state.jsonl` | 2026-10-13 to 10-14 | computed on demand |
| `ai/audits/` (29 files), `ai/review/` (5), `ai/verdicts.jsonl` (8 KB) | past audit reports; the 09-22 card verdicts | people and audit scripts | 2026-10-15 / 09-30 / 09-23 | reports; `verdicts.jsonl` is the append target of `Server/plugins/CardAnswer.js`, idle since 09-22 |
| `.claude/skills/past-work` | the procedure: run PastWork, judge in under 60k tokens | skill → every mastermind | 2026-10-15 | live procedure |
| `ai/dashboard/`, `public/framework/ai2/` | stale leftovers of the old dashboard / AI 2; `ai2/readme.md` says it is only an address now | none new | 2026-10-13 | **stale**, kept reachable |
| Earlier maps | [past-work map](/framework/ai/sessions/2026/10/15/voice-20261015/past-work-map/map.md), [tags](/framework/ai/sessions/2026/10/15/voice-20261015/ai-system/tags.md), [logging](/framework/ai/sessions/2026/10/15/voice-20261015/ai-system/logging.md), [follow-up](/framework/ai/doc/follow-up.md) | one-off audits, still accurate on 10-15 | | reference |

## 4. Topic tree: does the match set fit in one small file?

Yes. A script built `topic-tree.txt` from the real folders and the real topic list: the module directories as `tier/Name` lines (core, ext, ui, ux, styles, ai, Server, Servex, and the rest: 27 lines) plus the 277 topic names with their landed-task counts. **6,014 characters, about 1,700 tokens**, a sixth of the 10k limit. It leaves room to add the 316 ask features (about 3k more) and still be well under. Rebuild it from a script (`tree.mjs`, scratch for now) so it can never go stale.

## 5. Pilot: one Haiku minion, one session log, two angles

Session: the 2026-10-15 voice root (`voice-20261015/task.jsonl`, 148 KB, 235 lines, 103 chat lines, 9 action lines), with the topic tree beside it. Helper `helper-past-work-pilot`, `claude-haiku-5-5`, low effort, read-only. Spawned as a `helper`: the `minion` role was refused because no pool worktree was ready.

- **Summary (good):** "read-only audits of the AI and page systems, then built a per-module past-work script, the /live page, the tunnel's tool set; started a Refine audit, spawn policy and a tool-collapse plan." Accurate against the log.
- **Existing systems seen (good):** Servex, page_tools, Page, Item, List, RemoteMCP, Dictate, SessionIndex, ModuleLog, Asked, policy.js. All real.
- **Angle (a), topics from the owner's words:** sessions, page-system, Servex, minion, readme, refine, dictate, token accounting. Right areas, loosely named.
- **Angle (b), modules from the files:** the minion said `ai/sessions`; the real index says `ai`. Both only saw the task's own folder.
- **Where they disagree (the misses):** the owner's words and the log text show core/Page, ext/Refine, Servex/agents and Server/ work, but none of it was in `action.files`. **File tags alone would have filed a day of core/Page and Servex work under `ai`.** Words found it; files did not. This is the case for tagging from the prompts.
- **Cost:** context **117,514 tokens**, cost **$1.036**, one turn (Servex registry). The 148 KB JSONL is dense; reading it in chunks with line numbers pushed it over the 100k line, so the 5x rate applied. Aim for 30-60k.
- **Verdict: quality yes, cost no, as run.** Good enough for every session *if* a script first strips the log to what a classifier needs (title, request, owner chat text, the file list, outcome: about 5-15 KB, 2-5k tokens). Then a Haiku call is a few cents, and 851 sessions cost a few dollars. Without the strip, the whole archive would cost thousands.

## 6. Prompt logging and the naming rule

**What exists (read from `Servex/`):**
- `append_prompt_event` (`Servex/agents/Assistant.js`) is the fast assistant's *output* into the prompts log, not the owner's input.
- `log_session` (`tools.js`) appends a tag or note to a Claude session's `session.jsonl`; it is for audits, not prompts.
- `Sessions.say()` (`Servex/agents/Sessions.js`) does write the owner's raw words (`{chat:{from:{kind:"owner"},text,raw,via}}`), but only for the browser's own voice sessions through Dictate.
- `RemoteMCP.ask()` (`Servex/ext/remote/RemoteMCP.js`) already writes a `chat` line `owner (voice)` into the voice root's `task.jsonl`, plus a 200-character `remote_mcp` line in `ai/log.jsonl`. **But the text is `question`, what the voice agent chose to write, not the owner's words, and only when it calls `ask_mastermind`.**

**Proposal (small, not built):** give `ask_mastermind` an optional `raw` argument ("the owner's exact words, verbatim, as dictated") and make `ask()` write `{chat:{from:"owner (voice)", raw:true, text:raw, at, id:qid}}` just before the existing paraphrase line. Add one line to `RemoteMCP.INSTRUCTIONS` telling the voice agent to always pass `raw`. For turns that never reach the mastermind, a tiny `log_owner_words({text})` tool (a `call` away today) appends the same line. Result: the voice root's `task.jsonl` holds the real prompts, so the tags in section 5 can read them with no transcript. The owner's own file `owner-words.md` is the by-hand version of this.

**Naming rule:** done. Law 8 in the root `CLAUDE.md` (commit `010bebd07`): "Every new module or task settles its name and home location first."

## 7. Verdicts: keep, merge, scrap

| Index | Verdict | Why |
|---|---|---|
| `SessionIndex` + ext/Query `tasks` | **keep** (the one query) | Live, one reader. Add the prompt-derived topics to its rows; do not build a second. |
| `PastWork.mjs`, `ModuleLog.mjs`, `Asked.mjs` | **keep**, later **merge** their search into `SessionIndex.query` | They are scripts over the same rows; one entry point is clearer. |
| `ai/past-work-index.md` | **merge** into the topic tree (section 4) and generate on demand | A 96 KB hand-run snapshot goes stale the day after; the small tree can be rebuilt in a second. |
| `asks-outcomes` (AskTally) | **keep for now**, fold into the same pipeline as Refine | It is the only record of asks vs. outcomes; it is the same job as Refine (ask 13). |
| `ai/asks.jsonl` | **keep** | Routing status; not a search index. |
| `session-index.json`, `session-tree.json` | **merge**: feed the cost columns from the live `sessions` source or regenerate each run | The grid reads them for spend, so do not delete; they are 7 days old. |
| `sessions.json` | **merge** away: let the grid file take its row list from the live `sessions` source, then archive it under `ai/archive/` | Only `session-summary.mjs` reads it, to filter rows. |
| `ai/prompts.jsonl` | **keep, and use** | It is the existing `/log/prompts` destination; the raw-voice proposal can land here or in the voice root (decision 3). |
| `verdicts.jsonl` | **keep** | `CardAnswer.js` still appends to it. |
| `task-manifest.json` | **keep** | `TaskDirs.follow()` still resolves old paths through it. |
| `ai/dashboard`, `ai2/` | **scrap later**, after a visibility check on inbound links | Stale redirects; `ai2/readme.md` already says so. |

## 8. The owner's open decisions

1. **One pipeline for past and new prompts** (the owner's idea 13): approve building it as `SessionIndex` plus a script-stripped Haiku classifier that writes `topics` and path tags, run on every task close and retroactively over 851 sessions? Cost estimate: a few dollars for the backfill.
2. **Where the tags go:** a `topics`/`tags` line appended to each `task.jsonl` (survives, in git) versus recomputed in memory only. This doc recommends the appended line.
3. **Raw voice prompts:** approve the `raw` argument on `ask_mastermind` (section 6).
4. **Retire the three stale snapshots** (`sessions.json`, `session-index.json`, `session-tree.json`) once the Sessions page gets its spend from a live source; archive them under `ai/archive/`, never delete.
