# AI folder audit: what each entry in `ai/` is

Every entry directly under `public/framework/ai/`, most important first. Each row says what it is, who writes it, who reads it, and what to do with it.

Verdicts: **keep** (a live system) · **store** (session data that belongs in `ai/sessions/YYYY/MM/DD/<name>/`) · **module** (belongs beside a module, named in the row) · **aside** (nothing reads it, nothing wrote it in 14 days: moved to [`archive/aside-2026-10-20/`](../archive/aside-2026-10-20/)).

Census by script: [census.json](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/folder-audit/census.json) (every entry and one level down, with sizes, dates and code readers).

| Entry | What it is | Written by | Read by | Verdict |
|---|---|---|---|---|
| `sessions/` | The session store: one folder per session, and the day indexes | `TaskDirs`, `SessionRecord`, `append.mjs`, `AISessionIndex` | `AISession`, [sessions page](/framework/ai/sessions/) | keep |
| `cards.jsonl` | The AI cards store | `cards/` | `cards/`, `rail/` | keep |
| `asks.jsonl` | The owner's asks ledger | Servex, the ask verbs | `asks/`, `AITask/` | keep |
| `board.jsonl` | The old v/3 board log; `cards.jsonl` replaces it | the prompt hook | `v/` | keep (retired-looking, written 10-12: re-check after 10-26) |
| `log.jsonl`, `files.jsonl` | The AI log index and file index | `append.mjs` and the file tools | the AI pages | keep |
| `tasks/` | 252 legacy task folders, one per old slug | `TaskDirs` (older rule) | `Server/State.mjs`, `tasks/` | store: belongs in `sessions/` under the one-tree rule |
| `2026/` | Old date-pattern session tree (2 folders) | older `TaskDirs` | none | store: moved by `move-old-sessions.mjs` (dry run only) |
| `2026-10-13/` | Old date folder with one `files.jsonl` | older `TaskDirs` | none | store: follows the one-tree rule |
| `AISession/` | `AISession` classes: index, digest, cost, views | `AISessionIndex` | `sessions/` pages | module: beside `ai/sessions/` |
| `AITask/` | Task viewer classes: board, card, tree, feed | Servex, `new-task` | `tasks/`, `rail/` | module: beside `ai/tasks/` |
| `AIDashboard/` | The AI dashboard class and its rows | none (UI only) | `dashboard/` | module: beside `ai/dashboard/` |
| `rail/` | The AI rail: Overview, Needs, Log, Processes | the rail pages | the AI pages | module: beside the AI pages |
| `systems/` | `System`, `Systems`, `ReadmeSystem`, `NavigationSystem` | none | `systems-map.md`, `SystemClasses.js` | module: beside `core/` |
| `classes/` | Class index pages | `ClassIndexPage.js` | the catalog | module: beside `core/Page/` |
| `cards/` | The AI cards UI (card, rules, fold, tasks) | `cards/`, Servex | the AI board | keep |
| `asks/` | The asks page and its undone list | `asks/` | the AI pages | keep |
| `dashboard/` | The AI dashboard page | the page | the site | keep |
| `doc/` | Docs for the AI system (this file lives here) | people, `documentation` skill | the docs tab | keep |
| `handover.md` | The one screen a fresh session reads first | `handover` process | every new session | keep |
| `archive/` | Old folders kept for reference; receives the aside moves | `git mv` only | none | keep |
| `audits/` | Paging audit runs | the audit loop | `audits/` page | keep |
| `council/` | Council page and requirements | owner and agents | `council/` page | keep |
| `collab/` | Collab decisions and scoreboard | `Server/Collab.mjs` | `ext/Collab/Collab.js` | keep |
| `health/` | Health log and devbar page | `health/log.js` | the health page | keep |
| `inbox.jsonl` | The AI inbox | the inbox verbs | `rail/inbox.js` | keep |
| `landed/` | The landed log | `finish-task` | the AI pages | keep |
| `local/` | Local models page and VRAM log | `local/log-tool.js` | `local/` page | keep |
| `log/` | The log page | the log tools | the log page | keep |
| `models/` | The models page | the models tools | the models page | keep |
| `process/` | The process page | the page | `v/3/page.js` (a link) | keep |
| `prompts.jsonl` | The prompt log | the prompt hook | `Server/AskTally.mjs` and others | keep |
| `quick-fix/` | The quick-fix pool page | Servex | the quick-fix page | keep |
| `review/` | The review page and its questions | `Server/review.mjs` | the review page | keep |
| `page.js`, `page.jsonl` | The AI folder's own page | the page tools | the site | keep |
| `AIOverview.js` | The AI overview class (large) | none | the AI page | module: beside `ai/rail/` |
| `SystemClasses.js`, `objects.js`, `concepts.js`, `AISystem.js` | Loose class files at the top | none | the AI pages | module: move each beside its class |
| `skills.json`, `skills.mjs` | Skill registry | `skills.mjs` | Servex | keep |
| `stale-closes.jsonl` | Closed-stale records | the close sweep | `Servex` | keep |
| `systems-map.md` | The map of systems (linked from the root readme) | by hand | the root readme | keep |
| `past-work-index.md` | Index for the past-work skill | `Server/PastWork.mjs` | the past-work skill | keep |
| `todo.md` | The owner's running todo list | owner and agents | the AI pages | keep |
| `talk/` | The talk page | the page | the site | keep |
| `tests/` | Test fixtures and the AI test page | test pages | tests | keep |
| `usage/`, `usage.jsonl` | Usage page and usage log | the usage tools | the usage page | keep |
| `v/` | The v/2 and v/3 board pages | the pages | the site | keep |
| `verdicts.jsonl` | The verdicts log | the verdict tools | `cards/Rules.js`, `rail/inbox.js` | keep |
| `weight.jsonl` | Weights log | the weight tools | the AI pages | keep |
| `whisper/` | Whisper transcription files | the whisper page | the whisper page | keep |
| `day.jsonl` | Day log (last written 08-30) | `append.mjs` | `.claude/hooks/` | keep (stale, but code still names it) |
| `CLAUDE.copy.md` | A copy of CLAUDE.md | copied by hand (10-09) | nothing in code | keep (watch: a duplicate of the root CLAUDE.md) |
| `antigravity-usage.json`, `.jsonl` | Antigravity usage: writer only, last 10-06 | `Server/AntigravityUsage.mjs` | none | aside (moved) |
| `heartbeat.jsonl` | Heartbeat log, last 10-06, no code names it | none since 10-06 | none | aside (moved) |
| `handoff2.md`, `handoff2-owner-words.md` | The 09-28 handoff, retired (its own readme says so) | none since 09-28 | the old readme links only | keep (ai/readme.md and Servex/cards/readme.md link it; moved back by the architect) |
| `cand.txt` | Empty candidate list, 09-28 | none | none | aside (moved) |

## Counts

| Verdict | Rows | Files |
|---|---|---|
| keep | 39 | |
| store | 3 | |
| module | 8 | |
| aside | 4 (moved, one commit) | 6 |

## Loose ends

- Links into the moved files: `Servex/cards/readme.md` and `doc/readme-before-2026-10-19.md` still link `handoff2.md`; they now 404. Fix in a later task (the fence here was the `git mv` only).
- `tasks/` (252 folders) and the two old date trees need the one-tree mover; this audit only planned it.
- The old-session move is planned, not applied: [move-old-sessions.mjs](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/folder-audit/move-old-sessions.mjs) and its [manifest](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/folder-audit/move-manifest.jsonl) (1 to move, 1 skipped as live).
