<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Session twins  stop a session ever getting a second folder  the cause  fixed once " (words: session, twin, stop, ever, gett, second, folder, cause, fixed, once)

## Tasks (8, best first)
- 2026-10-07 [Token accounting: fixed the real undercount (144/145 project folders …](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/) — Found and fixed the real accounting bug, and planned the realtime sessions page. Found it — [findings.md](/framework/ai/2026-10-07/token-accounting/findings.md): a case-sensitive match hid 144 of 145 worktree folders from the cost ledger; readers fell back to…
- 2026-10-25 [Sessions: one session, one folder, one URL](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-identity/) — One session is one folder and one URL. The dated folder is the session's page; /framework/ai/sessions/<id>/ redirects to it. Merged to michael/dev, reviewed: 5 fixed, 4 declined ([review](review/report.md)). ![](shots/one-url-e00f55c9-1920.png) the two myster… · paths 1/1 exist
- 2026-10-03 [Sessions: no duplicate transcripts, date-path homes, Start/Stop/Durat…](/framework/ai/sessions/2026/10/02/panel2-sessions/sessions-date-homes/) — Reconciled the Sessions tab with three decisions made since it shipped. [/framework/ai/sessions/](/framework/ai/sessions/) no duplicate data — the 110-file transcripts/ copy is gone; prompts load live through /ai-logs/<id> a session's home is its date path — …
- 2026-09-30 [Voice sessions: fixed the doubled chat line, plus 10 second-review fi…](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/f-dupe-line/) — What landed: commit 1486ea2 in C:/Code/lew42/worktrees/voice-fixes. Part A, the double line on the ✦ sheet: fixed in rail.js (own_ats Set), proved with a headless run — the sentence shows once, not twice. B1 New session always starts fresh (fresh: true throug… · paths 2/2 exist
- 2026-10-25 [Session page: voice sessions no longer stall Overview/Timeline/Tasks/…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-page-blank/) — Voice session pages now load: Overview, Timeline, Tasks, Board and Coverage fill in, and the empty white strip is gone. Overview, Timeline, Tasks no longer blank: Overview shows 2 child sessions / 23 tasks, Timeline 229 events (f4e929097) Board and Coverage p…
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 18 files
- [ext/Session](/framework/ext/Session/) — used by 13 files

## Docs and readmes
- [Every prompt kept in its session's log (2026-10-10)](/framework/ext/Refine/doc/session-log-2026-10-10.md) — What: a prompt refined on the Refine page is saved in the session's own folder, in prompts.jsonl, in stages. Nothing is ever overwritten. |…
- [Tool collapse: 81 Servex tools in every session, a plan to …](/framework/ai/doc/tool-collapse.md) — Plan only, 2026-10-15. Nothing in Servex was changed and nothing restarted. The numbers come from a script you can rerun: [ToolCollapse.mjs…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [Session architecture — a record is its dated folder, and no…](/framework/core/Session/doc/architecture.md) — Session is the base class for any record that is made at a moment and lives in its own folder: <root>/YYYY/MM/DD/<slug>/ with a page.jsonl …
- [One replay: every line in a session's log is applied throug…](/framework/core/Session/doc/one-replay-plan.md) — The owner's rule (2026-10-26): every line of session.jsonl is applied through the replay system, by the item's set(), with no special proce…
- [Sessions vs docs — what goes where (the owner, 2026-10-19)](/framework/ai/doc/sessions-vs-docs.md) — Two places, two jobs. Putting a thing in the wrong one is how work gets lost. ## The session folder — log level, may be purged public/frame…
- [Ext — opt-in addons for the framework: an ext may patch cor…](/framework/ext/readme.md) — What goes here, and what goes in ai/: an ext is an opt-in addon any page can use. A module that exists only to run, show or feed an AI agen…
- [Session — one ✦ press is one voice session, answered by a f…](/framework/ext/Session/readme.md) — A session starts on the page you are on (its home), follows you from page to page, and keeps everything in one dated folder: /framework/ai/…

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,594 tokens of reading, under the 100k limit).

Question: Session twins: stop a session ever getting a second folder (the cause, fixed once)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Session twins: stop a session ever getting a second folder (the cause, fixed once)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
