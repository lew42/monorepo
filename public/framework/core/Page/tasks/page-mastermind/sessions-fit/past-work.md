<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "AI sessions pages  the 400 px tab bar and the 1920 sessions table fit" (words: session, 400, tab, bar, 1920, table, fit)

## Tasks (8, best first)
- 2026-10-09 [Sessions: red flags, roles and stable In-flight](/framework/ai/sessions/2026/10/09/session-1c89ffc4/sessions-red-flags/) — Sessions now flag expense and stalls, and (unknown) is small. negative durations gone: resumed agents kept an old stop time; now clamped (AISessionRows.span_ms) (unknown) role: 7,270 sessions down to about 427, classified from source, Servex registry and firs…
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…
- 2026-10-13 [AI pages: fresh-eyes review and fixes (Inbox, Sessions, session page,…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/review-ai-pages/) — Four AI pages reviewed at 400/1200/1920/3440; five fixes merged. [Models](/framework/ai/models/) drew outside its own page (header squeezed to 338 px, text over it at 400): now a normal page, tables one line per row at 1200+ [Inbox](/framework/ai/): the empty… · paths 2/2 exist
- 2026-10-13 [ext/drawer: the phone sheet's full state is the sidebar's tabs](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-sheet/) — The sheet's full state mounts the drawer tab row and body under the chat; mic keeps listening; mic-proof passes; merged 6441b0642 (change 4cb0adf91). 400 px shots only; 1200/1920/3440 layout-check not run.
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-12 [sessions-fixes](/framework/ai/sessions/2026/10/12/session-87bec773/sessions-fixes/) — Sessions page fixes, by ask (see [STATE.md](STATE.md), shots in [layout-check/](layout-check/)): 404 on ai/2026-10-11/files.jsonl gone: the rail skips days the ai/ index does not list. Missing page.jsonl as a quiet empty result: not stated as proven. 3440: ta…
- 2026-10-12 [Figma: capture proven, mapping table, Page 8 rebuilt](/framework/ai/sessions/2026/10/12/session-cd792e48/figma-phase2/) — Figma phase 2 landed (merge 8af2af4f7). Summary: [STATE.md](/framework/ai/2026-10-12/figma-phase2/STATE.md) layout findings fixed on [Figma](/framework/ext/Figma/) and [Palette](/framework/ext/Figma/palette/): layout-check at 4 widths capture proven at 400/12… · paths 3/3 exist
- 2026-10-12 [Sessions detail: tabs, hourly cost, fixed chat](/framework/ai/sessions/2026/10/12/session-f90a4e29/sessions-detail/) — Session detail is now tabs (Conversation, Cost, Models and tokens, Related) — [layout decisions](/framework/ai/sessions/doc/ui/detail-layout.md), [models and cost](/framework/ai/sessions/doc/cost/models-and-cost.md), [state](/framework/ai/2026-10-12/sessions-…

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 15 files
- [core/Sidebar](/framework/core/Sidebar/) — used by 22 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ext/tabs](/framework/ext/tabs/) — used by 37 files
- [ui/table](/framework/ui/table/) — used by 9 files
- [ui/toolbar](/framework/ui/toolbar/) — used by 9 files

## Docs and readmes
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [The chat tab, the path bar, and the mastermind log — 2026-0…](/framework/dev/DevBar/doc/chat.md) — ⚠ STATUS after the 23:16 reset (ai/sessions/2026/09/19/reset-recovery/): the path bar and the mastermind log below are live again; the chat…
- [Draggable — grab-and-move for any View; Sortable reorders, …](/framework/ext/Draggable/readme.md) — ## Use js import Sortable from "/framework/ext/Draggable/Sortable.js"; class Card extends Sortable { drop_check(target){ return target !== …
- [Prior work — every piece of layout and paging work found, i…](/framework/core/Page/layout/doc/prior-work.md) — Three read-only surveys went through /imagine/ and /layouts/, through framework/, and through two months of task logs (2026-09-29). This is…
- [Claim — a tab claimed by an agent: a ring around the viewpo…](/framework/dev/Claim/readme.md) — ## Use mcp__site__claim tab: "3e83f2c0", note: "<task-slug>" — ring the tab you drive mcp__site__release tab: "3e83f2c0" — when the task la…
- [Dev — the local-only tier: live reload, the DevBar rail, ta…](/framework/dev/readme.md) — ## Index [Claim](./Claim/) — a ring and label around a browser tab an agent has claimed, so you can see which tab is theirs [DevBar](./DevB…
- [DataGrid — one grid for every list of records: a table or a…](/framework/ext/DataGrid/readme.md) — Resize, sort, filter, windowing, and two drawers. The markup that used to be ui/datagrid and ui/table lives here now (those two files re-ex…
- [Sortable — what it adds on top of Draggable](/framework/ext/Draggable/doc/sortable.md) — Sortable extends Draggable and shares its pointer capture and hit-testing whole. What it changes: release() is overridden outright — it nev…

## Sessions tagged with these words
- 2026/10/13 [Minion arch table](/framework/ai/sessions/2026/10/13/session-0c0416a5/) — kind/agent model/haiku mod/ui/table task/mastermind-repo-slim docs/architecture · $0.18
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 AI 2: Inbox default, Log tab, heartbeats out, tabs left (minion-ai2-rescue-merge, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-09-30 AI 2 tab leak: pollers pause while hidden (minion-ai2-soak, landed)
- 2026-09-30 Shell: header, sidebars, footer; the dark dev shell on Ctrl+\ (task-mastermind-dev-shell, routed)

## Commits
- 50c45e71b sheet step 5: the route <path>/ai/, class AIPage extends Page
- f47732744 brief: sessions-fixes (detail 404s, 3440 empty space, 400 tab bar)
- d0c6b6691 one-dictation: the fast assistant refines each owner utterance, live, with its cost
- c0fecdf11 drawer: fix the AI tab's broken scroll/footer — a [hidden] dropdown that never closed
- 2ef2f5a3c drawer-chat round 2: the composer is one real panel, not a box in a box
- 3b1e344db drawer-chat: one AI tab, a clear session header, and a real composer panel
- a5646898a ai2/card.js: the card's own sidebar mount is chat.js now, desktop only; Widget.css: the orange assistant-bubb…
- 9cf225e03 Course correction: a stalled ask is an Inbox row, not a second view

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: AI sessions pages: the 400 px tab bar and the 1920 sessions table fit

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "AI sessions pages: the 400 px tab bar and the 1920 sessions table fit"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
