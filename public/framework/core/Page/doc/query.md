# page/query: finding past work (what exists, what is stale, what to do)

**Anchor:** this doc lives under `core/Page` because a generic "ask the system for rows" thing has no better home yet (the owner, 2026-10-16: "page/query"). Written 2026-10-16 by a discovery round, facts counted by script (`past-work/` task beside the voice session). Nothing was built; one cheap pilot was run.

## On one screen

- **Rounds 2 and 3 (the way forward) are [section 9](#9-the-way-forward-recommendation-revised-in-round-3).** A plain script extracts each session's owner prompts and final result for free; the result goes on the session snapshot that already carries cost (its `tags` field is empty today); Haiku is only a bounded fallback, newest first. Measured: the whole fallback is about $5.65 (round 2 said $19.47), the last 3 days $0.71.

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
| `Server/FollowUp.mjs`, `TaskState.mjs`, `LandingCheck.mjs`, `Audit.mjs` | what fell through the cracks, what is in flight, was the branch landed, audit consensus | task.jsonl / registry → `follow-up.md`, `tasks/index.jsonl` | 2026-10-13 to 10-14 | computed on demand |
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

1. **One pipeline for past and new prompts** (the owner's idea 13): approve building it as `SessionIndex` plus a script-stripped Haiku classifier that writes `topics` and path tags, run on every task close and retroactively? Round 3 (section 9): a free script pass first, Haiku only for sessions it cannot place, about $5.65 for everything and $0.71 for the last 3 days.
2. **Where the tags go:** revised in round 3: into the `tags` field of the session snapshot that `AISessionIndex` already writes (cost and `usd` live beside it), not a new line in each `task.jsonl`. The round 2 text below that proposed `task.jsonl` lines is superseded.
3. **Raw voice prompts:** approve the `raw` argument on `ask_mastermind` (section 6).
4. **Retire the three stale snapshots** (`sessions.json`, `session-index.json`, `session-tree.json`) once the Sessions page gets its spend from a live source; archive them under `ai/archive/`, never delete.


## 9. The way forward: recommendation (revised in round 3)

**Round 3 changes the plan in one sentence: extract with a plain script first (free, re-runnable), put the result on the session snapshot that already carries cost, and call Haiku only for the sessions the script cannot place.** Everything below the round 3 blocks is round 2 and is kept as the record; where a round 3 block disagrees, round 3 wins.

### Round 3 A: do task logs tell us what was touched? (computed, `pilot2/filesTouched.mjs`)

Of the 1,629 `task.jsonl` logs, **962 (59%) name at least one file and 667 (41%) name none.** Files are less common lately:

| Window (ending 2026-10-16) | Task logs | With files | None |
|---|---|---|---|
| Last day | 10 | 5 (50%) | 5 |
| Last 7 days | 283 | 148 (52%) | 135 |
| Last 30 days | 1,051 | 563 (54%) | 488 |
| All (2026-08 to 2026-10) | 1,629 | 962 (59%) | 667 |

By month it is 63%, 64%, 52% (Aug, Sep, Oct); the dip is 10-12, where 84 of 142 logs have no files. **For the 962 logs with files, "one clean module" is the common case but not the rule:**

- Counting `ai/` as a module: 54% touch exactly one module, 21% two, 19% three to five, 6% six or more. In 64% one module holds at least 80% of the files; the median top module holds 100%.
- Ignoring `ai/` (a task's own log and brief, which says nothing about topic): **36% of the logs touch only `ai/`**, so they get no module tag at all; of the other 614, 47% touch one module, 71% touch at most two, and in 58% one module holds at least 80% of the files. Median files per log is 4, p90 is 14, largest 238.

**Verdict: tagging by files touched is a workable fallback for about half the tasks, and a poor one for the rest.** It names a module for about 38% of all logs (614 of 1,629 have non-`ai/` files), is silent for the other 62%, and is noisy for the 21% that touch three or more. Use it as one signal, never as the only one.

### Round 3 B1: the plain-script extraction pass (no AI; `pilot2/extract.mjs`, `tag.mjs`)

`extract.mjs` reads every Claude transcript, skips machine pipeline calls, and keeps four things: the owner's real prompts (harness noise dropped), the last assistant message (the final result), the name of the Servex agent that was spawned (`[You are Servex agent clarity-unreferenced-census-fix.]`, which is a task slug), and the task folder its brief names. **It never keeps tool output or the assistant's middle turns.**

| Measured over all 9,603 transcripts | Result |
|---|---|
| Time | 54 to 71 seconds, one core, no model; it can run on every session, every day |
| Real sessions kept (machine calls skipped) | 4,403 |
| **Extracted size per session** | **median 765 characters (about 260 tokens), p90 2,453 (about 850 tokens)**, largest 409k (a pasted wall of text; capped at 30k in the cost model) |
| All sessions together | 7.4 MB, against 6.6 GB of raw transcripts |
| Sessions with at least one owner prompt | 1,660 (38%) |
| Sessions that only have a Servex brief and a result | 2,738 (62%); 2,173 of all sessions carry an agent name |

What this means: **38% of sessions contain words the owner or a person typed; 62% are agents working from a brief.** For those, the brief's task folder, the agent name and the final result are the content, and they are short.

How far the script alone can tag (`tag.mjs`, three signals): a module from the files the session edited (not counting `ai/`, scratch folders or worktree prefixes), a module from the task log that names the session (the `session_id` join SessionIndex already does), the task folder its brief names, and module-name keywords from the topic tree.

| | All 4,403 | Last 7 days (1,143) | Last 3 days (530) |
|---|---|---|---|
| Strong signal: edited non-`ai/` files, or its task log's files, or a named task folder | 1,136 (26%) | 351 (31%) | 245 (46%) |
| Named by a `task.jsonl` | 802 (18%) | 292 (26%) | 187 (35%) |
| Any keyword hit (two or more) | 2,609 (59%) | 61% | |
| No signal of any kind | 1,573 (36%) | 396 (35%) | 113 (21%) |

**Keywords are weak: when a session has both a keyword tag and an edited-file module, they agree only 28% of the time** (174 of 613), because the vocabulary is short and generic words leak in. So **the script alone resolves about a quarter of sessions with a strong tag and gives a rough hint for about another third. It is a good first pass and a good filter, not a replacement for a summary.** The remaining three quarters need either the model or an honest "untagged".

### Round 3 B2: cost and topic filters (confirmed, nothing to build for cost)

**Per-session cost already exists, live, and nearly every session has it.** `AISessionIndex` keeps one snapshot per session with `usd`, `tree_usd` (the session plus its children), `tokens`, `model`, `children`, `day`, `title`, `core` (modules from edited files), `category` and **`tags`, which is an empty array on all 9,381 snapshots today.** The snapshots are written into 35 day files, `sessions/YYYY/MM/DD/index.json` (2026-09-01 to 2026-10-16), and per-session `index.json`. Measured: **9,381 snapshots, 6,573 with a cost, $16,624 of list price in total; 4,342 of the 4,403 real sessions have a snapshot and 4,262 of those have a cost.** The old `session-index.json` is a stale copy of the same thing (2,707 rows, generated 2026-10-09).

So the wiring is small:

- **Cost filter:** add `usd_min`, `usd_max` and `tree` (use `tree_usd`) to the sessions query beside `since`, `text`, `agent` and `module`. The data is already there; it is one `filter` line and a sort key.
- **Topic filter:** fill the snapshot's `tags` field (Mention syntax, `#core/Page`). `AISessionIndex` is the one writer of those snapshots, so the tags go through it, not into a second file. The query filter on `tags` is then the same line as the cost one.
- **Both together** ("what did dictation work cost this week?") is `tags includes #ux/Dictate && day >= …`, summed on `usd`, computed in memory. No AI at query time.

### Round 3 B3: when Haiku is needed, and what it now costs

The extraction shrinks the model's input from the stripped 39M characters to **7.4M**, because the owner's prompts and the final result are the useful part and everything else is dropped. Same formula as before (2.9 characters per token, 100k characters a call, 2,200 tokens of fixed prompt, Haiku 4.5 at $1 in and $5 out per million) but with **150 output tokens a session** (one summary line and the tags) and each session capped at 30k characters (`tag.mjs`):

| Scope | Sessions | Haiku cost |
|---|---|---|
| Last 3 days (pilot) | 530 all, 285 without a strong signal | **$0.71 all, $0.30 for the 285** |
| Last 7 days | 1,143 all, 792 without | $1.38 all, **$0.79** |
| Everything (all 4,403; nearly all fall in the last 30 days) | 3,267 without a strong signal | **$5.65 all, $3.70 for the 3,267** |

This replaces round 2's $19.47 backlog: **about a third of the cost, and it needs no extra budget approval, because nothing is large.** The fallback runs only on sessions the script cannot place (the "no strong signal" row), on the **extracted text** (about 260 tokens a session), never on the full strip. Sessions with a strong signal still get their summary free from the result text; Haiku is for the rest. Sessions whose extracted text is under about 80 characters (an "OK" or an empty reply) are tagged `untagged` by the script and never sent.

### Round 3 B4: newest first, bounded

Do not process the whole history up front. **Run in this order, and stop between steps to look at 20 results:** the last 3 days (530 sessions, $0.71 all, or $0.30 for the ones without a strong signal), then the week ($1.38), then the month. The cheap extraction can be re-run over everything at any time, because it is free; only the Haiku step is bounded. Note that nearly all the 4,403 real sessions are from the last 30 days already (the day files start 2026-09-01), so "six months of history" is, today, about six weeks.

### Round 4: the session pipeline exists, and the first deliverable is in

The class is [`AISessionDigest`](/framework/ai/AISession/AISessionDigest.mjs) (node only, no AI): one transcript in, its sizes, exact usage and cost, owner prompts and result out. Full result with tables and the ranked "asked N times" list: [round4-result.md](/framework/ai/sessions/2026/10/16/voice-20261016/past-work/round4-result.md). In short, over the last 3 days (573 sessions):

- **Stripping is enough on its own.** 355 sessions are over 100k tokens raw; after stripping, 1 is. The stripped text is 2% of raw and 23% of the content blocks (tool results are 50% of the content, tool calls 27%). Median stripped session: 3,250 tokens.
- **Cost: the transcript's own `usage` is the truth.** Two independent parsers agree on 571 of 571 sessions. The live snapshots over-count 7 replayed sessions by $186 of $1,392, because `AISession.js` remembers only `RING = 40` message ids (**fix, not applied: keep every id in a Set, recompute those snapshots**). The Servex registry `cost` grows with turns (2.85x the real figure at 2-3 turns, 16x at 21+), so it is not a billed total. The "5-5" model rates in the price table are off (Sonnet 1.55x, Opus 0.87x, Haiku 3.3x against the registry on one-turn agents). **Two decisions for the owner: apply the `RING` fix, and replace the registry cost with the digest.**
- **The repeated-asks detector works.** 18 recurring topics over 30 days, found by one Haiku cluster pass ($0.16 for the whole round). Haiku's open/fixed read is a lead, not a verdict: the chat-bubble dedup entry was checked by hand (fixed in code 10-09 in `b87834ba2`, both headless proofs pass, not re-reported since) and the rest are labelled unverified.
- **Not covered by transcripts:** the owner's words to a voice agent that never reached one, and sessions with no task folder (`Server/Transcripts.mjs`, from the helper, has the 72 sessions that do; 1,480 do not, and five of them hold 562 of the owner's typed prompts). A name and home for those is still open.

### Round 3 plan, in order (replaces "Build order" below)

1. **Move `extract.mjs` and `tag.mjs` into one class, `SessionTagger`** (`Server/SessionTagger.mjs`, beside `SessionIndex`): `extract(file)`, `tag(extract)` (the script signals), `resolve()` (which sessions still need the model), `call(packed)` (Haiku), `validate(tags)` (snap to real folders, drop invented ones), `store(tags)` (writes the snapshot's `tags` through `AISessionIndex`).
2. **Run the script over the last 3 days, then store the tags.** Look at 20 sessions against what the work was. Stop if they are not clearly better than the file tags in `core`.
3. **Add the cost filter** (`usd_min`, `usd_max`, `tree`) and the `tags` filter to the sessions query and to the Sessions grid.
4. **Haiku fallback on the last 3 days' unresolved sessions ($0.30),** look again, then the week ($0.79), then the month.
5. Call `SessionTagger` from `finish-task` for the closing session, plus a daily sweep for sessions that never finished.
6. **`load({ since })`** day-window in SessionIndex, and retire the stale snapshots (`session-index.json` and friends) once the grid reads spend from the live snapshots.
7. The `raw` argument on `ask_mastermind` (section 6), so the voice agent's own words reach the next transcript.

**The decision needed from the owner:** approve step 2 (the script pass over the last 3 days, which costs nothing) and the Haiku fallback with a ceiling of **$5 in total**. Everything else follows from what those 20 results look like.

### Round 2, kept as the record

**Round 2's answer.** Keep SessionIndex as the one live query. Fix the weak part, the tags, by tagging each session once when it is done: a node script strips its Claude transcript to the useful 1%, one cheap Haiku call (Haiku 4.5, no thinking) returns a summary and tags, and a script checks the tags against the real folders before they are saved. The same code runs on the 3,145 past sessions, on every new one, and on a schedule. Nothing calls an AI at query time. Measured: **about $0.006 a session, about $20 for the whole backlog, about $20 a month at today's pace.** Pilot files and outputs: [`pilot2/`](/framework/ai/sessions/2026/10/16/voice-20261016/past-work/pilot2/readme.md).

### What the transcripts really are (measured by script)

| | Count | Size |
|---|---|---|
| Claude SDK transcripts under `~/.claude/projects/` | 9,602 | 6.6 GB raw (median 277 KB, largest 89 MB) |
| of those: **machine pipeline calls** (dictation chunk cleaners 3,244, transcript outliners 1,478, small judges) | 5,201 | skip, never tag |
| **real work sessions** | 4,401 | **about 39 million characters once stripped, 0.6% of the raw size** |
| of those: under 2 KB stripped (one prompt, nothing done) | 1,256 | tag by script from the first prompt, no model |
| **sessions that need a model** | 3,145 | median 5.5 KB, p90 23 KB, 25 over 150 KB, largest 1.4 MB |
| of those: named by a `task.jsonl` | 759 | the rest are minions, duty agents and CLI sessions with no task folder |

"Stripped" keeps the owner's prompts, the assistant's own text, and the paths of edited files; it drops tool output, which is where the 99% is. One catch: an orchestrating mastermind edits no files itself (the pilot session shows 0 edited files), so its tags come from its text, and a child's tags roll up to its parent through the task tree.

### Pilot: one session, the stripped path

Session `6097c76b` (a mastermind that had 12 minions write architecture docs; 40 KB stripped, about 16k tokens in, about 400 out). Run as `claude -p` from a script, so there is no tool schema and no Servex overhead.

| Run | Cost | Result |
|---|---|---|
| Haiku 5.5, defaults | $0.214 | good, picked 6 modules; but a 1-hour cache write bills double, and Haiku 5.5 lists at about $4 in and $20 out per million tokens (worked out from the reported cost), four times Haiku 4.5 |
| Haiku 4.5, defaults | $0.074 | 62 s: it thought for 7,156 tokens, and modules came out as bare tiers (`core`, `ui`) |
| Haiku 4.5, thinking off | $0.039 | all 12 modules named, correct; a hidden second Haiku call re-sent the whole prompt (18.6k tokens, $0.019) |
| **Haiku 4.5, final settings** | **$0.018, 5 s** | the same 12 modules, a correct two-sentence summary, three owner asks, `confidence: high` |
| **8 small sessions packed in one call** | **$0.018, 20 s** | **$0.0023 a session**; summaries accurate |

The settings that matter, all in `classify2.mjs`: `MAX_THINKING_TOKENS=0` (no thinking), `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` (kills the hidden duplicate call, halves the cost), `DISABLE_PROMPT_CACHING=1` (no double-priced cache write), `--tools ""`, `--system-prompt`, and a scratch working directory. The brief named `claude-haiku-5-5`; for tagging, Haiku 4.5 matched its quality at a quarter of the price.

**The model proposes, a script disposes.** In the packed run, **5 of 20 module tags did not exist** (`design/controls`, `ext/Previews`; also files, not directories: `core/Page/PageContent`, `Servex/agents/page_tools`). A validator must check every tag against the real folder tree, snap a file to its directory, and drop anything unknown into `new_topics`. The single run: 12 of 12 real.

### The cost, before anything big runs (round 2; superseded by round 3 B3, which prices the extracted text, not the full strip)

Formula (`estimate.mjs`): input tokens at about 2.9 characters each, packed up to 100k characters a call, 2,200 tokens of fixed prompt per call, 300 output tokens per session. Haiku 4.5 at $1 in and $5 out per million.

| Scope | Sessions | Calls | Cost |
|---|---|---|---|
| **One session** (median, packed) | 1 | | **about $0.002 to $0.006** |
| Last 7 days | 702 | 107 | $4.35, so about $0.62 a day, about $19 a month |
| Backlog, only sessions with a task log | 759 | 236 | $8.06 |
| **Backlog, every real session over 2 KB** | 3,145 | 483 | **$19.47** (one call each instead: $25) |
| "Hundreds a day for a month" (300 a day) | 9,000 | | about $55 a month |

Run time: about 5 s a call, so 483 calls take under an hour, or 15 minutes with four in parallel. `total_cost_usd` is the list price; if these calls run on the owner's plan the limit that bites is the weekly allowance, not dollars, so the first backfill should go in recency order and stop at a stated token budget. Cheaper still if needed: cap the 25 huge sessions at 40 KB (saves about $2.5), and tag only task-linked sessions first ($8).

### The word-count pre-pass (no model): done, and what it says

A script lowercased every human-looking prompt in the 4,401 sessions, dropped stop words, and counted the sessions each word appears in. **It does not surface the owner's concepts.** Of the 1,167 sessions that have any such prompt, the top terms are harness text, not the owner: "continued from a previous conversation" (249 sessions), "original image ... displayed ... multiply coordinates" (about 510), "stop hook feedback" (81). The owner's dictation reaches the model through the voice agent and Refine, not as a clean prompt in a transcript. After removing that noise, what is left is thin and ordinary: card, framework, page, mastermind, servex, live, ask, worktree, design, tabs, merge. **Recommendation: use the pre-pass only as a noise filter** (the script already drops the harness phrases), and take the concept list from the 277 topic names plus the module folders (the topic tree, 1,700 tokens), which are written text with the real vocabulary. Ambiguity ("page" is a class, a page someone built, and the system) is handled in the prompt: `#core/Page` means the Page class; any other page is tagged by its own module path.

### Is ext/Mention the tag system?

**Yes for the syntax and the display, no for storage.** The pattern already allows `#core/Page` (the name may contain `/`), `@agent`, and a `/path` lookup (`ref_entry`), and `md()` and chat already render these as links. So a tag saved as the string `#core/Page` or `#dictate` shows up as a clickable chip anywhere markdown renders, with no new code. What it lacks: its maps (`maps/refs.js`, 81 lines; `people.js`, 36) are hand-written, about 50 things, and a module path would resolve through the live-page lookup, not a map entry. A topic namespace needs a third map, **generated** from the topic list, never hand-edited. So: **store tags as plain Mention-syntax strings in the data (`#module/path`, `#topic`, `@agent`), validate them by script, and let Mention render them.** Do not store them as map entries.

### Recommendations, in the owner's eight points

1. **Live over stale, with a date window.** SessionIndex loads all 1,629 task logs in 0.9 s and 36 MB today; at the current growth (about 120 tasks a day) six months would be about 21,000 logs, 12 s and 480 MB. Task folders are already dated (`sessions/YYYY/MM/DD/`), so give `load({ since })` a day-folder walk that reads only the days in the window and loads older days only when a query asks for them (`ensure(since)`). The `since` filter already exists on `query()`; this only moves it earlier, to the file walk.
   - `session-index.json`, `session-tree.json`: the grid reads them for spend. Keep until the grid's spend comes from the live `sessions` source, then archive under `ai/archive/`. Until then, regenerate both at `finish-task` (the script `Server/session-summary.mjs` exists), so they are never more than a task old instead of seven days.
   - `sessions.json`: only `session-summary.mjs` filters by it; make it read the live source, then archive.
   - `ai/past-work-index.md` (96 KB): stop hand-running it; replace with the generated topic tree.
2. **Accurate categorisation by tagging when work is done.** Confirmed by the pilot: words and summaries find what file lists miss. No AI at query time; queries filter on the saved tags in memory.
3. **Directory granularity.** The prompt asks for the deepest directory that holds the real work and says to skip logs, task files and readmes touched in passing. The validator snaps files to directories. Routine files never become tags.
4. **Task logs are thin; the transcript has the substance.** Agreed and now cheap: the summary comes from the transcript, not the title. The result is stored with the task, so the title can stay short.
5. **The retroactive pipeline.** Built as a pilot, with these differences from the sketch: the strip is a plain script (done, `strip.mjs`); a session under about 100k characters is **one** call (the owner's 50k-token chunk applies only to the 25 huge ones, which get about 25k-token chunks plus one roll-up call); small sessions are **packed** several to a call, which is what makes it cheap; every call stays under 50k tokens in and about 1k out, far below the 100k line. Model: Haiku 4.5.
6. **The pre-pass.** See above: a noise filter plus the topic list, not a concept generator.
7. **One pipeline for past, current and future.** One class, `SessionTagger` (home: `Server/SessionTagger.mjs`, beside `SessionIndex`): `strip(file)`, `pack(sessions)`, `call(packed)`, `validate(tags)`, `store(tags)`. Past: a loop over the transcripts. Current and future: `finish-task` calls it for the closing session (about half a cent), and a sweep catches sessions that never finished. It is the Refine idea applied to logs; it does not need the Refine queue.
8. **Cost.** Table above. Nothing big runs until the $8 task-linked pass has been eyeballed on about 20 results against what the log says.

### Where the tags are saved (round 2; superseded: round 3 B2 stores them in the snapshot's `tags` field)

The name `tags` and the Mention-syntax strings still stand; only the home changed, from `task.jsonl` and `tags.jsonl` to the existing session snapshot.

- **Name:** `tags`. One line per session: `{"tags":{"session":"<id>","summary":"...","modules":["core/Page"],"topics":["dictate"],"asks":["..."],"confidence":"high","by":"haiku-4-5","at":"..."}}`.
- **Home:** for a session a task log names, **appended to that `task.jsonl`** (SessionIndex's watcher reads it live, git keeps it, the line is append-only so nothing is overwritten). For a session with no task folder: one `tags.jsonl` per day folder (`sessions/YYYY/MM/DD/tags.jsonl`), written with `.claude/hooks/append.mjs`, never by hand. SessionIndex gains one reader for each. `module_of()` then prefers the saved `modules` over the file-list guess, which is what ends "everything is `ai`".
- A tag is never edited; a re-run appends a newer line, and the index uses the latest.

### Build order, and what stops it (round 2; superseded by "Round 3 plan, in order" above)

1. **`SessionTagger` + validator + the tags line + SessionIndex reads it.** About a day of work; run it on the last 7 days of task-linked sessions (under $2). Check 20 results by eye against `PastWork`. *Stop here if the tags are not clearly better than the file tags.*
2. **`finish-task` and a sweep call it** for new sessions.
3. **Backfill, task-linked sessions first ($8), then the rest ($11),** newest first, within a stated token budget.
4. **`load({ since })` day-window** in SessionIndex.
5. **Sessions grid spend from the live source;** archive `sessions.json`, `session-index.json`, `session-tree.json`.
6. **The `raw` argument on `ask_mastermind`** (section 6), so the voice agent's own words are in the next transcript.

**The one decision needed from the owner:** approve step 1 (the pipeline and about $2 of pilot tagging) and the $20 backfill budget, with step 3 held until the 20-result check passes.
