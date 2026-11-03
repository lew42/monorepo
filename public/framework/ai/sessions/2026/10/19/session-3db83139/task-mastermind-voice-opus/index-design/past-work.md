<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Sessions  what indexing  tags and nesting exist today  read only design check " (words: session, index, tag, nest, exist, today, read, only, design, check)

## Tasks (8, best first)
- 2026-10-16 [Session pipeline: digest.json and tags for the last 3 days](/framework/ai/sessions/2026/10/16/voice-20261016/past-work/) — Round 4 steps 3 and 4 landed. digest.json beside each session folder, node only, add only: 587 of 607 sessions (20 have no folder yet); a second run wrote 0 and kept 587 (commit bd39fad93) tags filled for the last 3 days, newest first: procedural (kind/ model… · paths 2/2 exist
- 2026-10-15 [framework/ai: readme smoke-test rule, logging, tags, asked-for summary](/framework/ai/sessions/2026/10/15/voice-20261015/ai-system/) — Rule added to the mastermind skill; framework/ai readmes audited (3 fixes, rest listed); append.mjs now stamps every line; in-memory query exists (SessionIndex + ext/Query), tags recommended; node Server/Asked.mjs answers 'didn't I ask for X?'. · paths 1/1 exist
- 2026-10-17 [Socket: a phone may run read-only queries, so Last landed and Waiting…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/mobile-socket/) — A LAN peer can now ask the socket for the task tree; commands are still refused. one list in [Socket.js](/framework/dev/Socket/): LAN_OK gains query, and LAN_QUERY names the only two sources a phone may ask (sessions, tasks); rule in [lan.md](/framework/dev/S… · paths 1/1 exist
- 2026-10-13 [Readmes: all under 100 lines, every module indexed](/framework/ai/sessions/2026/10/12/session-87bec773/readme-audit/) — Readme audit landed on michael/dev — 13 oversized readmes trimmed to under 100 lines, 93 unlisted modules now indexed, dead links 41 down to 26. Bodies moved verbatim to doc/; nothing lost. Script lists line counts, dead links, unindexed modules: audit.mjs, r… · paths 1/2 exist, gone: framework/ai/handover
- 2026-10-13 [Readmes: today's pages reachable, a reach script, the Server readme t…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/readme-upkeep/) — Every page that landed today is linked from its readme; Server/readme-reach.mjs checks it; the skills proposals doc is linked; the Server readme's body moved to its doc. Commit ba73481e9. Landed by the mastermind from the agent's own commit (the agent ended i…
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…
- 2026-10-12 [Today's UI: shot, read, two narrow-screen fixes](/framework/ai/sessions/2026/10/12/session-87bec773/today-shots-review/) — Shot 10 of today's pages at 400/1200/1920/3440 and fixed two defects. [Report](/framework/ai/sessions/2026/10/12/session-87bec773/today-shots-review/report.md) DataGrid demo overlap at 400: fixed (916492fc2), re-shot Refine 'Said' label squeeze at 400: fixed …
- 2026-10-12 [Page, sessions and Servex readmes trimmed to an index](/framework/ai/sessions/2026/10/12/session-51ad4d45/readme-trim/) — Three readmes trimmed; sections moved verbatim to doc/ (c0b8fa1c0, 164d22cd4, e0fbf9830, cc26c0d43, on michael/dev). Landed by the night mastermind: the session merged but ended before writing this line.

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 9 files
- [ext/DataGrid](/framework/ext/DataGrid/) — used by 7 files
- [ext/DesignTool](/framework/ext/DesignTool/) — used by 32 files
- [ext/Session](/framework/ext/Session/) — used by 9 files
- [ui/datagrid](/framework/ui/datagrid/) — used by 3 files
- [ui/tags](/framework/ui/tags/) — used by 6 files

## Docs and readmes
- [Widths — the meter for styles/layouts/400/: ten urls read a…](/framework/ext/DesignTool/widths/readme.md) — ## Use Open [/framework/ext/DesignTool/widths/](/framework/ext/DesignTool/widths/) and press a width button. The same call, from code: js i…
- [Ask — talk to a Claude Code session from the browser; for p…](/framework/ext/Ask/readme.md) — ## Use js import { ask, available } from "/framework/ext/Ask/Ask.js"; if (available()) { const { text } = await ask("Name the three widest …
- [Taste — the third DesignTool tier: eleven weighted ideal ra…](/framework/ext/DesignTool/taste/readme.md) — ## Use js import { rate } from "/framework/ext/DesignTool/taste/taste.js"; rate(document.querySelector(".page.active-page")); // → { score,…
- [Tests — twenty-three layouts with a declared verdict, so th…](/framework/ext/DesignTool/tests/readme.md) — ## Use js import cases from "/framework/ext/DesignTool/tests/cases.js"; // Each case declares what it IS: a "bad" case names the one rule i…
- [vision — screenshots × a model × a prompt, one JSONL line e…](/framework/ext/DesignTool/vision/readme.md) — ## Use bash node public/framework/ext/DesignTool/vision/run.mjs \ --pages /framework/,/framework/ui/ --widths 390,1280,3440 --regions auto …
- [AISession — one Claude session as a class family](/framework/ai/AISession/readme.md) — AISession reads one session's transcript once and keeps its cost; the classes beside it are the views and tools that grow around that. The …
- [AI system docs: the index](/framework/ai/doc/readme.md) — One folder per subsystem, one current doc per topic. Load the folder you need; the rest costs nothing. Superseded files sit in [archive/](a…
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…

## Sessions tagged with these words
- 2026/10/14 [Reading page design](/framework/ai/sessions/2026/10/14/session-09b6c5ca/) — kind/agent model/sonnet work/read-only task/figma-claude-designs framework/sessions · $0.17
- 2026/10/16 [Voice mastermind](/framework/ai/sessions/2026/10/16/session-6a73099d/) — kind/owner model/sonnet work/read-only task/voice-today · $2.79
- 2026/10/15 [Standing rules for domain masterminds](/framework/ai/sessions/2026/10/15/session-7e1f2802/) — kind/owner model/sonnet work/read-only task/standing-rules framework/sessions · $0.57
- 2026/10/15 [Spawn policy mastermind role](/framework/ai/sessions/2026/10/15/session-35ca9f31/) — kind/owner model/sonnet work/read-only task/spawn-policy framework/sessions · $0.90
- 2026/10/14 [Screenshots never committed](/framework/ai/sessions/2026/10/14/session-d60d1ad7/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim framework/sessions · $1.12
- 2026/10/14 [Sessions list page](/framework/ai/sessions/2026/10/14/session-acc3233e/) — kind/owner model/sonnet work/read-only framework/sessions · $0.24

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)
- 2026-09-30 Design and code: /framework/design/ and /framework/code/ as browsable knowledge; skills t… (task-mastermind-design-code, routed)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, landed)

## Commits
- 32bf9eebb Split session cache from record, index meta, tag/attention filters, log_session tool, keyboard on buttons
- a178ce2fd Sessions: honest Stop/Duration, real date-path rows, fix the 1200 squeeze

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,892 tokens of reading, under the 100k limit).

Question: Sessions: what indexing, tags and nesting exist today (read-only design check)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Sessions: what indexing, tags and nesting exist today (read-only design check)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
