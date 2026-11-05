# Readers of saved lines outside core/

Scope: `Server/`, `Servex/`, `.claude/hooks/`, `public/framework/ai/`, `public/framework/ext/`, `public/framework/ux/`. Grep-based, tests and session scratch excluded. Only verbs (method calls such as `start`, `complete`, `stop`, `finish`) and list members (`tasks.<id>`, `tasks.add`) can be spelled marked, so field reads (`assign`, `log`, `chat`, `decision`, `landed_at`, `outcome`) are not listed as risks.

| Path:line | What it reads | Misses marked? |
|---|---|---|
| `Server/UndoneAsks.mjs:78` | `l.complete` verb | yes |
| `Server/UndoneAsks.mjs:79` | `l.stop` verb | yes |
| `Server/StaleClose.mjs:67` | `!l.stop && !l.unclosed && !l.start` (a marked `start()` would count as worked) | yes |
| `Server/AIIndex.mjs:128` | `l.finish ?? l.complete` verb | yes |
| `Server/DatedFiles.mjs:278` | `l.finish \|\| l.closed` verb | yes (finish) |
| `Server/PromptRecords.mjs:301` | `Object.entries(l.tasks)` keys matched against ids, and `Object.keys(v)[0]` verb switch (complete/stop/start/approve) | yes |
| `Server/CloseoutWalk.mjs:128` | `Object.keys(l.tasks)` existence check per task id | yes |
| `Servex/CloseLoop.js:27` | `l.complete?.outcome` verb | yes |
| `Server/PromptRecords.mjs:299` | `l.tasks?.add` (method) | unsure: depends on whether `add` is marked |
| `Server/PromptRecords.mjs:227` | `l.tasks?.add` plus a `state()` helper | unsure |
| `Server/PromptsToSession.mjs:62` | `l.tasks?.add` | unsure |
| `Server/ChildLinks.mjs:163` | `l?.tasks?.add` | unsure |
| `Servex/Dropped.js:55` | `l.tasks?.add` count | unsure |
| `Servex/Follow.js:85` | `j.tasks?.add?.type` | unsure |
| `Server/AIIndex.mjs:147` | `l.action?.at` (field, not a verb) | no |

Readers of field-only lines (`assign`, `log`, `chat`, `decision`, `landed_at`) were checked in the same pass and do not match a verb or list member: for example `Server/owner-check.mjs:159`, `Server/on-landing.mjs:50`, `Servex/cards/Cards.js:233`, `Servex/asks/tasks.js:105`, `.claude/hooks/ledger.mjs:58`, `Servex/agents/tools.js:116`.

Not checked (out of scope or not reached in this pass): the `page_tools.js` and `Sessions.js` hits are field reads (`t.state`, `chat`), so they were not listed. `Servex/ProcessRunner.js:62-74` reads the action argument of an item call, not a saved line, so it is not a risk.

**Verdict: fix these 8 first** (the 8 "yes" rows: UndoneAsks 78 and 79, StaleClose 67, AIIndex 128, DatedFiles 278, PromptRecords 301, CloseoutWalk 128, CloseLoop 27). Then confirm the 5 "unsure" rows with a test that writes `#id` and `add()` spellings.
