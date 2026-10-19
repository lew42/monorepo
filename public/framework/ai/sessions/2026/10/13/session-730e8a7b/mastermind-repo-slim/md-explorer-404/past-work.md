<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The Markdown Explorer lists markdown files only  no probing of subfolders  no same origin 404s" (words: markdown, explorer, list, fil, only, prob, subfolder, same, origin, 404)

## Tasks (8, best first)
- 2026-10-17 [Socket: a phone may run read-only queries, so Last landed and Waiting…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/mobile-socket/) — A LAN peer can now ask the socket for the task tree; commands are still refused. one list in [Socket.js](/framework/dev/Socket/): LAN_OK gains query, and LAN_QUERY names the only two sources a phone may ask (sessions, tasks); rule in [lan.md](/framework/dev/S… · paths 1/1 exist
- 2026-10-03 [Console-clean: 404 storm stopped, smoke.mjs gates on noise, soak test…](/framework/ai/sessions/2026/10/03/8261071d-a510-4b6b-a3b2-07c3ceca36ac/console-clean/) — Landed. /framework/ai/live/: console lines 210→1(allowed), same-origin 404s 351→0. All six asks done (checklist and proof in task.jsonl). smoke.mjs now fails merges on a same-origin 404 or >5 unlisted warn/log lines; Server/console-allow.jsonl holds the three… · paths 1/2 exist, gone: framework/ai/live/
- 2026-10-03 [Layouts: explorer's centre now carries the verdict, browse stays the …](/framework/ai/sessions/2026/10/03/list-events/layout-approve-join/) — One verdict, two views — [Explorer](/layouts/explorer/) · [Browse](/layouts/browse/) grid → single view (nav left, centre, variants right) — already built; untouched Approve/Improve + the verdict now sit on the explorer's centre, under the picture at the layo…
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-09-29 [Page files: each folder lists its own files](/framework/ai/sessions/2026/09/29/page-files-log/page-files-log/) — Each folder now lists its own files; pages stop fetching the 3.3 MB directory.json. ![](md-1920.png) each folder lists its own entries: 2,429 files.jsonl; a card's page.jsonl keeps its list changes append: proved, a read adds 0 lines backfill: second run 0/0 … · paths 0/3 exist, gone: framework/core/Page/md/ framework/ext/files/fs/ framework/core/Page/md/doc/jsonl/
- 2026-09-28 [minion-b](/framework/ai/sessions/2026/09/28/file-explorer-fs/file-explorer-fs/minion-b/) — Minion B: <any path>/fs/, the full-screen file view -- the route, full-screen chrome, trailing-slash check, production fallback, a Folder link from every page, and the Files tab's full-screen link.
- 2026-09-28 [file-explorer-fs](/framework/ai/sessions/2026/09/28/file-explorer-fs/file-explorer-fs/) — See requirements.md: audit ext/files, strip ext/Panel, a real expandable tree, <any path>/fs full-screen route, a link from every page, keep the Doc Files tab working.
- 2026-09-28 [Commit the live system: 326 uncommitted files into 12 named commits o…](/framework/ai/sessions/2026/09/29/1a4ab710-89f0-45d1-88ca-1f929880a2d1/commit-live-system/) — Landed — 326 uncommitted files went from git status --short down to about 10-12 (that count keeps moving; other agents are writing live), in 12 commits on michael/dev, none pushed. Groups + reasoning: [groups.md](/framework/ai/2026-09-28/commit-live-system/gr… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/List](/framework/core/List/) — used by 23 files
- [ext/files](/framework/ext/files/) — used by 23 files
- [ext/filesystem](/framework/ext/filesystem/) — used by 27 files
- [ext/markdown](/framework/ext/markdown/) — used by 55 files
- [ux/Filter](/framework/ux/Filter/) — used by 3 files

## Docs and readmes
- [Markdown — md() for prose and md.file() for a whole .md, as…](/framework/ext/markdown/readme.md) — ## Index [open](./open/) — the same markdown link opened three ways, to show the page decides where a link opens ## Use js import { md } fr…
- [Every page has an md/ — its markdown files, as pages](/framework/core/Page/doc/markdown.md) — Add md/ to any page's url and you get that folder's markdown, rendered. Nothing to write: it is built into Page, so every module has it. | …
- [Why the file list is declared](/framework/ext/Doc/doc/files.md) — The Files tab shows the module's real files: the tree, doc/file/<path>.md, and the source — three [ext/Panel](/framework/ext/Panel/) leaves…
- [PageFilesExplorer Notes](/framework/ext/files/doc/explorer-notes.md) — ## What is PageFilesExplorer v2 of the file explorer (v1 is PageFiles in fs.js). v1 is classic full-screen: no site chrome, one file at a t…
- [A fence can name its file](/framework/ext/markdown/doc/file-labels.md) — Added 2026-08-15, alongside ext/Doc. A fenced code block's info string can carry a second word naming the file it's from: js /app.js import…
- [Research architecture — append-only files, validated in cod…](/framework/ext/Research/doc/architecture.md) — Research lets several minions dig a question into append-only log files that a page renders as they grow. Two shapes share one module: a to…
- [catalog — two arrangements of previews() patched onto Page,…](/framework/ext/catalog/readme.md) — ## Use js initialize(){ this.catalog(); } // rail — the page's own content() becomes the first card const BANDS = { Surfaces: "card toolbar…
- [A fetched file's relative links pointed at the route](/framework/ext/markdown/doc/relative-links.md) — The bug. styles/readme.md contains [base](base/). A browser resolves that against the document, and the SPA fallback makes the document url…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Dictate framework component](/framework/ai/sessions/2026/10/16/session-e99e8190/) — kind/owner model/sonnet work/read-only · $0.13
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00

## Owner asks
- 2026-09-30 Inbox: core/Page/ext/Inbox extension; AI 2 Inbox to /framework/ai/; Needs you a filter; L… (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (servex-mastermind-opus, landed)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard, queued)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)

## Commits
- 212a16848 Markdown Explorer: /<module>/md/ is a Browse (readme in the pane, every .md listed), plus the md tab
- ad417e411 Add <any path>/fs/, the full-screen file view

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: The Markdown Explorer lists markdown files only: no probing of subfolders, no same-origin 404s

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The Markdown Explorer lists markdown files only: no probing of subfolders, no same-origin 404s"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
