<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Top tabs  one row that side scrolls everywhere  sticky under a header that scrolls away  half the side padding on a phone" (words: top, tab, one, row, side, scroll, everywhere, sticky, under, header, away, half, padd, phone)

## Tasks (8, best first)
- 2026-10-04 [Doc header: mobile tab row scrolls instead of wrapping](/framework/ai/sessions/2026/10/05/mobile-doc-header/mobile-doc-header/) — Under ~600px the Doc page header is ~30% shorter. The tab row now scrolls sideways on one line instead of wrapping to a 2nd/3rd row below the title. title stacks above a full-width, one-line, side-scrolling tab row — CSS only, same markup: public/framework/ex… · paths 4/4 exist
- 2026-09-30 [layout-check gains --bands: tab rows, left-padding stack, top-level b…](/framework/ai/sessions/2026/09/30/page-audit/page-audit/bands-tool/) — Landed: Server/layout-check.mjs --bands — the four band-reading numbers the brief asked for, per width, in layout.json. tab_rows: 6 rows measured at 400px on /framework/core/Page/, matched row-for-row against the screenshot. left_stack: 28px→90px across width… · paths 1/1 exist
- 2026-10-20 [Phone sheet: reconnects after a Servex restart, one layout that only …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/) — The phone ✦ sheet reconnects after a Servex restart, and is one three-row layout at every height. Merged 3415f5018. | Before | After | |---|---| | ![](/framework/ux/Dictate/surfaces/sheet-steps/before/sheet-003.png) | ![](/framework/ux/Dictate/surfaces/sheet-… · paths 2/2 exist
- 2026-10-14 [Inbox: one list-and-detail view, waiting-on-you at the top](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-browse/) — The Inbox runs on one list-and-detail view, [Browse](/framework/ux/Browse/), and pins Waiting on you at the top. - ✅ The class architecture: [Architecture tab](/framework/ux/Browse/architecture/). Browse is the orchestrator, Inbox.Rail extends Browse, AIRail … · paths 2/3 exist, gone: framework/ux/Browse/architecture/
- 2026-10-13 [Dictation: New session really starts fresh, walked on phone and deskt…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/) — The dictation flow, walked on the phone and the desktop drawer: New session now really starts a new conversation. [Report](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/review.md) ![](/framework/ai/sessions/2026/10/1… · paths 1/1 exist
- 2026-10-13 [ext/drawer: the phone sheet's full state is the sidebar's tabs](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-sheet/) — The sheet's full state mounts the drawer tab row and body under the chat; mic keeps listening; mic-proof passes; merged 6441b0642 (change 4cb0adf91). 400 px shots only; 1200/1920/3440 layout-check not run.
- 2026-10-03 [Ref row: always dark, header-only link, body nested inside the card](/framework/ai/sessions/2026/10/03/list-events/ref-row-context-card/) — Landed: a ref row is now the inline #Page chip upgraded to a full-width card, per the owner's correction. whole row always dark (class-card look), never conditional on entry.class_card header links (icon+name chip, same as an inline mention); body does not li…
- 2026-10-23 [Sessions: phone pages, as the mobile variant](/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/) — Four phone pages, ready to merge (branch worktree/mobile-picks, 11 commits, today's dev merged in, merges cleanly; the merge is yours). four pages at 400 px, real data, tap through: day-400.png, session-400.png, task-400.png children nested under their parent…

## Modules that exist now (files outside the module that import it)
- [core/Sidebar](/framework/core/Sidebar/) — used by 22 files
- [ext/tabs](/framework/ext/tabs/) — used by 37 files
- [ui/row](/framework/ui/row/) — used by 7 files
- [ui/table](/framework/ui/table/) — used by 9 files
- [ux/Browse](/framework/ux/Browse/) — used by 4 files
- [ux/Understand](/framework/ux/Understand/) — used by 2 files

## Docs and readmes
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [Below 52em — a top bar and a hamburger](/framework/core/Sidebar/doc/narrow.md) — Stacked, the panel sits above the content, so its full height is a wall you scroll past to reach the page. At 7 entries that was fine; at 3…
- [catalog — two arrangements of previews() patched onto Page,…](/framework/ext/catalog/readme.md) — ## Use js initialize(){ this.catalog(); } // rail — the page's own content() becomes the first card const BANDS = { Surfaces: "card toolbar…
- [table architecture — a re-export, so one table lives in one…](/framework/ui/table/doc/architecture.md) — ui/table is a two-line shim. The table code lives in DataGrid.table(head, rows) inside [ext/DataGrid](/framework/ext/DataGrid/); this modul…
- [Mobile: why the phone said "socket connecting" (2026-10-09)](/framework/ux/Dictate/doc/mobile-socket-2026-10-09.md) — Short answer. Whisper is not a socket and it works from a phone. The "socket" in the old status line was the dev site's live-reload socket,…
- [Try it on your phone — voice to session page](/framework/ux/Dictate/doc/try-it.md) — You talk (or type); five stages appear live on a page, one under another. That page is the feedback loop. ## Steps 1. On the phone, open ht…
- [Inbox data: where the inbox's rows come from, and the one s…](/framework/core/Page/ext/Inbox/doc/inbox-data.md) — See it: [the inbox timeline](/framework/core/Page/ext/Inbox/timeline/): every landed task, owner note and needs-you card in one ranked rail…
- [Prior work — every piece of layout and paging work found, i…](/framework/core/Page/layout/doc/prior-work.md) — Three read-only surveys went through /imagine/ and /layouts/, through framework/, and through two months of task logs (2026-09-29). This is…

## Sessions tagged with these words
- 2026/10/14 [Inbox browse rebuild](/framework/ai/sessions/2026/10/14/session-6214b71d/) — kind/owner model/opus mod/ux/browse mod/core/page task/mastermind-repo-slim framework/inbox · $8.16
- 2026/10/13 [ext/tabs architecture documentation](/framework/ai/sessions/2026/10/13/session-f9024369/) — kind/agent model/haiku mod/ext/tabs task/mastermind-repo-slim docs/architecture · $0.21
- 2026/10/13 [Core/Sidebar architecture documentation](/framework/ai/sessions/2026/10/13/session-e73992f7/) — kind/agent model/haiku mod/core/sidebar docs/architecture · $0.27
- 2026/10/13 [Minion arch table](/framework/ai/sessions/2026/10/13/session-0c0416a5/) — kind/agent model/haiku mod/ui/table task/mastermind-repo-slim docs/architecture · $0.18

## Owner asks
- 2026-10-03 Drawer: tight header, one scroll area, composer footer flush with default padding (task-mastermind-drawer-cleanup, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)

## Commits
- 7a705b520 Session page (desktop): sticky stats bar, Overview cards (open, project, done, dropped), Tasks and Chat tabs,…
- 5a7b2fc29 Work tab review fixes: child sessions found across later day files (cost + Approve), Review.state() is the on…
- d19f42815 sheet step 7: the live space, class AIFeed extends View
- bfc7949fd sheet step 6: the desktop dock, Sheet.Dock
- 987016773 ai: rename the CLAUDE.md copy to CLAUDE.copy.md so Claude Code stops loading it as a second, older rulebook
- 6ee3c6aa9 sessions: fix the VS Code cost undercount and show the per-1% inputs
- 1c6b89989 Sessions: no duplicate transcripts, date-path seam, Start/Stop/Duration
- 198c82ed7 syntax-guard: fix false-positive spawn/fork method-definition flags

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,992 tokens of reading, under the 100k limit).

Question: Top tabs: one row that side-scrolls everywhere, sticky under a header that scrolls away; half the side padding on a phone

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Top tabs: one row that side-scrolls everywhere, sticky under a header that scrolls away; half the side padding on a phone"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
