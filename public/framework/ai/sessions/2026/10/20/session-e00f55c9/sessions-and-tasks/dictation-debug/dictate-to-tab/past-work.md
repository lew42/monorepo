<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  a Debug tab that shows each layer  and the stall fixed" (words: dictation, debug, tab, show, each, layer, stall, fixed)

## Tasks (8, best first)
- 2026-10-24 [Dictation: Debug tab, and the stall found and fixed](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/) — Ready to merge: branch worktree/dictation-debug (6 commits). [Report](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/build/report.md) · [doc](/framework/ux/Dictate/doc/debug-tab.md) - ✅ The stall: one unanswered send blo… · paths 0/1 exist, gone: framework/ext/drawer/ai/debug/
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-12 [Sessions detail: tabs, hourly cost, fixed chat](/framework/ai/sessions/2026/10/12/session-f90a4e29/sessions-detail/) — Session detail is now tabs (Conversation, Cost, Models and tokens, Related) — [layout decisions](/framework/ai/sessions/doc/ui/detail-layout.md), [models and cost](/framework/ai/sessions/doc/cost/models-and-cost.md), [state](/framework/ai/2026-10-12/sessions-…
- 2026-10-04 [Sessions: VS Code tab cost was silently stalling after midnight](/framework/ai/sessions/2026/10/04/vscode-session-cost/vscode-session-cost/) — Found the real bug and fixed it: a VS Code tab's cost stopped updating once its page passed midnight. Session 60d9def6 (this mastermind's own tab) was stuck at $29.12; its real transcript already priced at $110.07. VS Code cost from its own transcript, no tim…
- 2026-10-24 [Roles: a roles page and each session's role](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/roles/) — Each agent role is now an object you can see: the [roles page](/framework/servex/roles/) lists every role with its model, effort and live agents, and a session page's Models and tokens tab shows its role's defaults beside what it really ran on (bbbf16724). a … · paths 1/1 exist
- 2026-10-13 [Dictation: New session really starts fresh, walked on phone and deskt…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/) — The dictation flow, walked on the phone and the desktop drawer: New session now really starts a new conversation. [Report](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/review.md) ![](/framework/ai/sessions/2026/10/1… · paths 1/1 exist
- 2026-10-03 [AI inbox: page_set data corruption, the your-prompts 404, Activity-ta…](/framework/ai/sessions/2026/10/03/71eead80-a869-421f-83bb-eba7ff83510e/inbox-cards-work/) — Ten fixes landed on michael/dev. The data-corrupting page_set(id) bug, the your-prompts 404, the Activity tab breaking rail navigation, noisy card previews, jargon titles, a Mention path-link bug, and double-spaced code blocks. Three more caught live: card rh… · paths 0/1 exist, gone: framework/ai/your-prompts/
- 2026-10-02 [panel2-sessions Part 2: AI Dashboard + Sessions tabs](/framework/ai/sessions/2026/10/02/panel2-sessions/panel2-sessions/part2-sessions-dashboard/) — Dashboard + Sessions tabs shipped on top of ext/panel2. Sessions tab: live, tagged (Servex/VS Code/CLI), newest first; click → prompts in order verified on the named VS Code session (361c4d18) after fixing a turnOrigin bug Dashboard tab: one Panel2, full-widt… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [ext/tabs](/framework/ext/tabs/) — used by 37 files
- [ui/table](/framework/ui/table/) — used by 9 files

## Docs and readmes
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [Navigation: one model — four questions about the site's nav…](/framework/core/Page/navigation/model/readme.md) — [Live page](/framework/core/Page/navigation/model/). The owner asked four questions on 2026-10-14 ([the dictation](/framework/ai/sessions/2…
- [Doc architecture — a module is a page with four fixed tabs](/framework/ext/Doc/doc/architecture.md) — Doc turns a module into a browsable page: Overview, API, Docs, Files, plus any declared children. It is a class, [Doc.js](../Doc.js), that …
- [Dropdown architecture — a trigger that shows its choice, an…](/framework/ext/Dropdown/doc/architecture.md) — Dropdown is one choice out of a short list: a button that shows the current option's picture and name, and a [popover] list that opens abov…
- [asks.js — Asks Tab Design Notes](/framework/ai/AITask/doc/asks-notes.md) — ## The Asks Tab Shows everything the owner asked for in this session as preview cards, each linked back to the sentence they said it in. On…
- [AITask views: what each one shows, and who uses it (checked…](/framework/ai/AITask/doc/views.md) — One screen. The owner asked ([ask 3](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-10.md)) whether t…
- [Dashboard — a grid of live previews, stalled first](/framework/ai/dashboard/readme.md) — The owner's own words: "/framework/ai's default tab could show a grid-like dashboard that includes the inbox, but also the log next to it, …
- [Dictation, per page](/framework/core/Page/ai/doc/dictation.md) — The microphone lives in the drawer — [ext/drawer](/framework/ext/drawer/) — the same component on every page, opened with the same ☰ button…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-e39150d7/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)
- 2026-10-12 Pages as live streamed parts; each page shows its own tasks (asked 9x) (mastermind-page-ai-api, routed)
- 2026-10-13 Dictation: sheet shows the chat and mic; release the mic when hidden (?, landed)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-10-02 Hamburger drawer: closing it sometimes doesn't give the page its space back (fixed itself… (task-mastermind-one-dictation, building)

## Commits
- 49da4398c dictation-debug: second builder queued for dictate-to-tab
- b2caa1815 ai: briefs, dictation debug tab + stall, and this session's task closeout (owner)
- c0faf8b1c Dictate playground: real classes + live Structure panel + full-bleed

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,563 tokens of reading, under the 100k limit).

Question: Dictation: a Debug tab that shows each layer, and the stall fixed

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: a Debug tab that shows each layer, and the stall fixed"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
