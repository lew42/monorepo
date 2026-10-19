<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Command characters in Mention    is a path    an actor    a class  each with its own icon and colour  shown on the Mention page" (words: command, character, mention, path, actor, clas, each, own, icon, color, shown)

## Tasks (8, best first)
- 2026-10-16 [Sheet: rail.js renamed to class Sheet; audit and proposal posted](/framework/ai/sessions/2026/10/16/voice-20261016/sheet/) — The phone sheet is now one class, Sheet ([ext/drawer/Sheet.js](/framework/ext/drawer/)), merged as 41c9607e7 and checked on the live site (✦ opens, ✕ closes, the desktop ☰ opens the AI tab). The audit found that one ☰ icon means navigation on a phone and AI o… · paths 1/1 exist
- 2026-10-14 [Navigation: one model, shown](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/nav-model/) — Navigation: one model, shown ([page](/framework/core/Page/navigation/model/)); reviewed: 2 fixed, 4 noted ([review](review/report.md)) recursive navigation: four rules, live demos at 1200 and 3440 (shots/…-navigation-model/1920.png) workspace vs document: [a … · paths 2/2 exist
- 2026-10-12 [Page: Columns and Links move to their own classes](/framework/ai/sessions/2026/10/12/session-e55f5a4b/page-split-2/) — Page.class.js is 1315 to 1086 lines. Columns and Links now live in their own class files; Page keeps the same facades. Reviewed: 1 fixed, 4 noted ([review.md](/framework/ai/2026-10-12/page-split-2/review.md)). Step 5, Columns out of Page: Columns.js (PageColu…
- 2026-10-12 [Owner inbox: one owner_note path pinned to the top](/framework/ai/sessions/2026/10/12/session-d2fd8fab/owner-inbox/) — owner_note landed. Agents now tell the owner through one tool; the note sits first in the AI Inbox until the owner opens it. note reaches the owner and stays: score 100, no decay, first row; headless at 400/1200/1920/3440, no errors ([STATE.md](/framework/ai/…
- 2026-10-03 [ext/Mention: refs.js auto-syncs its icon, no sync.mjs run needed](/framework/ai/sessions/2026/10/03/list-events/mention-auto-sync/) — Landed: ext/Mention/maps/refs.js's icon rebuilds itself. [Server/plugins/MentionSync.js](/framework/servex/fs/?file=Server) sits on the dev server's shared watcher and rewrites a changed icon on its own — proved live by flipping core/Sidebar/page.js's icon an… · paths 2/3 exist, gone: framework/ext/Mention/md/doc/syntax/
- 2026-10-02 [inspect(): class cards for every object, then the Dictate playground …](/framework/ai/sessions/2026/10/02/bc9e77bd-9e53-4c08-99c7-0346f2f0f5d1/inspect/) — Both parts landed. every class gets an icon + a debug inspect() card: [Inspect.js](/framework/ux/Content/Object/Inspect.js), live on [ux/Content/Object](/framework/ux/Content/Object/) Dictate's data becomes real classes: [objects.js](/framework/ux/Dictate/pla… · paths 4/4 exist
- 2026-10-02 [Framework home: sections from the sidebar's own tree, dark class card…](/framework/ai/sessions/2026/10/02/framework-home/) — Landed. /framework/ is a wall of sections, one per sidebar group, read from the sidebar's own tree. Classes get dark cards, columns balance by height, old page kept at /framework/old/. back up the old page — [/framework/old/](/framework/old/) sections in side… · paths 4/4 exist
- 2026-09-30 [Mention: #references and @people become icon links](/framework/ai/sessions/2026/09/30/mentions/mentions/build-2/) — #Page and @owner now become a small icon + the word, linking to the real thing — built to the owner's mid-build design change (two namespaces, one map per control character), not the original @Name text. All five deliverables are written; none of the mechanic… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [ext/Classify](/framework/ext/Classify/) — used by 1 files
- [ext/Dropdown](/framework/ext/Dropdown/) — used by 5 files
- [ext/markdown](/framework/ext/markdown/) — used by 55 files
- [ext/Mention](/framework/ext/Mention/) — used by 9 files
- [ui/icon](/framework/ui/icon/) — used by 0 files

## Docs and readmes
- [Mention architecture — two maps, read synchronously, shown …](/framework/ext/Mention/doc/architecture.md) — ext/Mention turns #Page, @owner and /path in written text into a small icon + word that links to the thing it names. Its main entry is [Men…
- [Mention — #Page and @owner become a small icon + the word, …](/framework/ext/Mention/readme.md) — #Page is a reference to a real thing on the site — a page, a module, a doc. @owner is a person or an agent role. Write either one in any ma…
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [Navigation: one model — four questions about the site's nav…](/framework/core/Page/navigation/model/readme.md) — [Live page](/framework/core/Page/navigation/model/). The owner asked four questions on 2026-10-14 ([the dictation](/framework/ai/sessions/2…
- [Style library — every token, ground, class and layout the C…](/framework/styles/readme.md) — What goes here: the vocabulary (tokens, the four grounds, .card, utilities, layouts, sections). Next door: how and where to write a rule → …
- [The voice UI: classes, who owns what (2026-10-09)](/framework/ux/Dictate/doc/voice-architecture.md) — The owner's complaint: Dictate, Refine and the right-hand drawer each show "a dictation widget", and they look like copies. This page names…
- [Page.class.js comment blocks: what to do with each (DONE 20…](/framework/core/Page/doc/comment-plan.md) — Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history …
- [The page tool: any agent changes any page by path + delta (…](/framework/core/Page/doc/page-tool-2026-10-09.md) — Dictated in VS Code tab 7efd07d5. Shared by the page system and the AI system (linked from both readmes). ## The owner's ask - Any agent (a…

## Sessions tagged with these words
- 2026/10/15 [Page system class map documentation](/framework/ai/sessions/2026/10/15/session-09f3c4b6/) — kind/owner model/sonnet task/page-system docs/classes · $0.38
- 2026/10/13 [Icon swap kit](/framework/ai/sessions/2026/10/13/session-aff00916/) — kind/owner model/sonnet mod/ext/figma mod/ai/sessions task/figma-claude-designs page/icon-swap · $5.49
- 2026/10/19 [Ultracode](/framework/ai/sessions/2026/10/19/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $551.47
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02

## Owner asks
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)
- 2026-09-30 Mentions: paths like @Servex/Heartbeat (parent/child) (task-mastermind-mentions, routed)
- 2026-09-30 Mentions: / path references, one map, opt-in processing (task-mastermind-mentions, building)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, landed)
- 2026-09-30 Mentions: paths like @Servex/Heartbeat (parent/child) (task-mastermind-mentions, landed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: Command characters in Mention: `/` is a path, `@` an actor, `#` a class, each with its own icon and colour, shown on the Mention page

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Command characters in Mention: `/` is a path, `@` an actor, `#` a class, each with its own icon and colour, shown on the Mention page"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
