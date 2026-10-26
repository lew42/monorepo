<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Agent name links in chat go to a page that does not exist  ext Mention Mention js agent_entry   line  106  builds  fra" (words: agent, name, link, chat, do, not, exist, ext, mention, entry, line, 106, build, fra)

## Tasks (8, best first)
- 2026-10-25 [Agent-name links in chat go to a page that does not exist. ext/Mentio…](/framework/ai/sessions/2026/10/25/session-15fa7f56/mastermind-agent-name-links-resolve/) — (no outcome logged)
- 2026-10-03 [Link styles + merge gate: blue links fixed, text-touching-edges now f…](/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/) — Landed — every <a> now gets the house link style, not just ones in prose, and Server/smoke.mjs fails the merge on text flush against an unpadded edge or anything above a page's title. Commit a3248c70 on michael/dev. links styled everywhere: [shot, /framework/… · paths 1/1 exist
- 2026-09-30 [Mention: #references and @people become icon links](/framework/ai/sessions/2026/09/30/mentions/mentions/build-2/) — #Page and @owner now become a small icon + the word, linking to the real thing — built to the owner's mid-build design change (two namespaces, one map per control character), not the original @Name text. All five deliverables are written; none of the mechanic… · paths 1/1 exist
- 2026-10-25 [context alerts: a child's log gets a line at 50% and 75% of the window](/framework/ai/sessions/2026/10/24/session-7c6c8d93/minion-context-alerts/) — ready to merge: branch context-alerts (../ctx-alerts), 2 commits on michael/dev. Agent.context_alert() writes one alert: line per level to the child's session log, Follow forwards it to the parent; test and doc added
- 2026-10-05 [Voice cards: types, amend, icon chip, proposals, model-switch context](/framework/ai/sessions/2026/10/05/voice-chat-cards-and-model-context/) — Proposal written: voice cards and model-switch context ([report](/framework/ai/2026-10-05/voice-chat-cards-and-model-context/report.md)) card types: 5 picker types + the line kinds, report §2 amending a card: every part can be amended except a message, so the…
- 2026-10-03 [ext/Mention: refs.js auto-syncs its icon, no sync.mjs run needed](/framework/ai/sessions/2026/10/03/list-events/mention-auto-sync/) — Landed: ext/Mention/maps/refs.js's icon rebuilds itself. [Server/plugins/MentionSync.js](/framework/servex/fs/?file=Server) sits on the dev server's shared watcher and rewrites a changed icon on its own — proved live by flipping core/Sidebar/page.js's icon an… · paths 2/3 exist, gone: framework/ext/Mention/md/doc/syntax/
- 2026-10-03 [Ref row: always dark, header-only link, body nested inside the card](/framework/ai/sessions/2026/10/03/list-events/ref-row-context-card/) — Landed: a ref row is now the inline #Page chip upgraded to a full-width card, per the owner's correction. whole row always dark (class-card look), never conditional on entry.class_card header links (icon+name chip, same as an inline mention); body does not li…
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/

## Modules that exist now (files outside the module that import it)
- [core/doc](/framework/core/doc/) — used by 0 files, no readme
- [ext/Chat](/framework/ext/Chat/) — used by 13 files
- [ext/CSSDoc](/framework/ext/CSSDoc/) — used by 2 files
- [ext/Doc](/framework/ext/Doc/) — used by 21 files
- [ext/Dropdown](/framework/ext/Dropdown/) — used by 6 files
- [ext/markdown](/framework/ext/markdown/) — used by 56 files

## Docs and readmes
- [ChatPanel: design notes and removed commentary](/framework/ext/Chat/doc/ChatPanel-notes.md) — ## Panel naming and URL routing A stable name per panel on a page, in build order — the same on a reload, so a drilled-in url (#chat=panel-…
- [Dropdown — one choice out of a list: a trigger showing its …](/framework/ext/Dropdown/readme.md) — ## Use js import dropdown from "/framework/ext/Dropdown/dropdown.js"; dropdown({ options: [{ value: "flex", label: "flex", icon: "view_colu…
- [Phase 2 — deferred, not built](/framework/ext/Timeline/doc/phase-2.md) — Everything here was named and consciously deferred during the 2026-08-14 design pass ([framework/ai/sessions/2026/08/14/timeline/design.md]…
- [Mic.js notes](/framework/ext/Chat/doc/mic-notes.md) — The long comments pruned from Mic.js (2026-10-12), kept word for word, one heading each. The code points here with // see doc/mic-notes.md#…
- [Sheet.js comment notes (the file was rail.js until 2026-10-…](/framework/ext/drawer/doc/rail-notes.md) — Comments pruned from rail.js, now Sheet.js (2026-10-12), kept verbatim, in file order. The headings keep the old names (DrawerRail is Sheet…
- [ext/Timeline](/framework/audit/doc/ext-Timeline.md) — ext/Timeline is a well-built, well-isolated CSS-variable timeline view — 121 lines of JS, no dependencies beyond core/View, zoom/orientatio…
- [Extensions — a page.jsonl line turns a small piece of behav…](/framework/core/Page/ext/readme.md) — See it running: [this page](/framework/core/Page/ext/) — its own page.jsonl has one line, {"ext": "Inbox"}, and two {"inbox": …} messages. …
- [Composer function: design, rationale, and decisions](/framework/ext/Chat/doc/Composer-notes.md) — ## API and function signature (lines 6-36) ONE BOX ON TOP, FULL WIDTH; the mic, Send and one ⚙ menu button sit in ONE ROW below it (one-dic…

## Sessions tagged with these words
- 2026/10/13 [Ext/Dropdown architecture](/framework/ai/sessions/2026/10/13/session-dc95c123/) — kind/agent model/haiku mod/ext/dropdown task/mastermind-repo-slim framework/tasks · $0.17
- 2026/10/13 [Mention architecture documentation](/framework/ai/sessions/2026/10/13/session-8d442dd5/) — kind/agent model/haiku mod/ext/mention task/mastermind-repo-slim docs/architecture · $0.20
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-9e1dd563/) — kind/agent model/sonnet work/read-only task/usage-pace-line docs/usage · $0.14
- 2026/10/13 [ext/tabs architecture documentation](/framework/ai/sessions/2026/10/13/session-f9024369/) — kind/agent model/haiku mod/ext/tabs task/mastermind-repo-slim docs/architecture · $0.21
- 2026/10/13 [Architecture.md highlight refactor](/framework/ai/sessions/2026/10/13/session-e14ce642/) — kind/agent model/haiku mod/ext/highlight docs/architecture · $0.25

## Owner asks
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, building)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Memory: dormant idle agents, working cap, auto-compaction (task-mastermind-dormant-idle, landed)

## Commits
- bed558cc7 one-store: no code writes ai/<date>/ again — writers through TaskDirs, a guard that refuses the old shape, gu…
- 7e4271335 skills: resolve the usage conflict (check-claude-usage now says usage-now.mjs, never write usage.json), retir…
- c4cc54660 Content-row rendering: card rhythm, live agent mentions, inline chip size
- 3b1e344db drawer-chat: one AI tab, a clear session header, and a real composer panel
- 359f25a40 docs-check fixes: resync the stale CLAUDE.md copy, de-dupe its write, name the System tab's two unlinked sub-…
- e2f651ec1 core/Page/ai/: one tile set, and a filtered live-agents widget

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Agent-name links in chat go to a page that does not exist. ext/Mention/Mention.js agent_entry() (line ~106) builds `/fra

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Agent-name links in chat go to a page that does not exist. ext/Mention/Mention.js agent_entry() (line ~106) builds `/fra"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
