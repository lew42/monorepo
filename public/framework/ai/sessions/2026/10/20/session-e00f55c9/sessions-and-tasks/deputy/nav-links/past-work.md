<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Nav links  every page this week can be clicked to" (words: nav, link, every, week, can, clicked)

## Tasks (8, best first)
- 2026-10-20 [nav-links](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/nav-links/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/nav-links/requirements.md
- 2026-10-12 [Page: part-link cards, promote script, #id scroll](/framework/ai/sessions/2026/10/12/session-78a7b293/part-link/) — A page block can now become its own page, and the parent keeps a link card. Merged into michael/dev (56d44968f). a part-link content kind: [demo](/framework/core/Page/jsonl/part-link-demo/), doc [part-link.md](/framework/core/Page/doc/part-link.md) and the ai… · paths 2/2 exist
- 2026-10-12 [Page: open-work line on every page, weight on any object](/framework/ai/sessions/2026/10/12/session-a2bdd14b/page-context-asks/) — Every page now shows its open tasks, and any object can carry a weight. #6 open tasks per page: a "N open tasks on this page" line on every Page and Doc page, from computed ai/page-work.json — [page-work-line.md](/framework/core/Page/ai/doc/page-work-line.md)… · paths 1/1 exist
- 2026-10-03 [Link styles + merge gate: blue links fixed, text-touching-edges now f…](/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/) — Landed — every <a> now gets the house link style, not just ones in prose, and Server/smoke.mjs fails the merge on text flush against an unpadded edge or anything above a page's title. Commit a3248c70 on michael/dev. links styled everywhere: [shot, /framework/… · paths 1/1 exist
- 2026-10-01 [Token spend: Opus is 70% of the week, $322 of it solo](/framework/ai/sessions/2026/10/01/token-efficiency/token-efficiency/) — What landed: [report.md](report.md) — a ranked look at 7 days of real spend ($1,521 across 88 spend.json + 375 task.jsonl files). where the tokens went: Opus is 70% ($1,058/$1,521); $322 of that is 73 Opus tasks run solo with zero sub-agents ten cheapest wins…
- 2026-09-29 [node_modules: found what emptied it, guards so it can't again](/framework/ai/sessions/2026/09/29/8e50318b-7bf9-4e51-bedd-b91580b96caa/node-modules-guard/) — Cause proven, and four guards so a worktree can never empty node_modules again. name the cause: a mastermind hand-linked both node_modules into main with mklink /J, then ran git worktree remove --force at 13:46:47, and git deleted through the links. [cause.md…
- 2026-09-29 [File system: File and Directory objects, /fs beside the nav, links to…](/framework/ai/sessions/2026/09/29/file-system/file-system/) — File system landed: file objects, /fs beside the site nav, links to a file and a line. [Walkthrough](/framework/ai/2026-09-29/file-system/walkthrough/) File and directory objects: [File system](/framework/ext/filesystem/) Right-click menu: Copy path, Open in … · paths 3/4 exist, gone: framework/ext/filesystem/fs/FsFile.js/
- 2026-09-28 [Fresh-eyes review: a new agent checks every task before merge](/framework/ai/sessions/2026/09/28/b6fa1bc1-fad0-4bdd-9b20-8cd1cd20afb4/fresh-eyes-review/) — A fresh agent now reviews every task before it merges, sized by the diff — none / light (Sonnet) / full (Opus, with screenshots). Reviewed: 10 fixed, 2 declined — [review.md](/framework/ai/2026-09-28/fresh-eyes-review/review.md) Review built into the task sys…

## Docs and readmes
- [Router — everything between "a url changed" and "the DOM re…](/framework/core/Router/readme.md) — ## Use html <a href="/docs/intro/">Intro</a> That is the whole API. Each url segment is one page.child(name), a miss is an import, and a ur…
- [The corpus — every page the Router can reach, and how that …](/framework/core/Search/doc/corpus.md) — A search result is a promise: click it and you land on that page. So the corpus is not "every directory on disk" and not "every link anybod…
- [Where a clicked link opens — the page decides](/framework/core/Page/doc/open.md) — A link carries no target. When you click a link inside the app, the Router asks the page that holds the link where it should go, by calling…
- [Navigation — the path: how links look, persistent or switch…](/framework/design/navigation/readme.md) — Navigation is how a reader gets anywhere on the site and finds their way back: tabs, a rail, a sidebar, a sheet, a modal, full screen. Move…
- [Tree — nested rows you can open, drag and drill into. One c…](/framework/ux/Tree/readme.md) — Rows from a plain array, or straight from a Page's children. The keyboard is always on. Drag, the drill-down and the row buttons are proper…
- [content — every shape a page's content can take, one child …](/framework/core/Page/content-shapes/readme.md) — Live: [/framework/core/Page/content-shapes/](/framework/core/Page/content-shapes/). The design: [doc/content.md](../doc/content.md), "Desig…
- [Prior work on navigation — every row the inventory found](/framework/core/Page/navigation/doc/prior-work.md) — Three read-only inventory passes fed this page: [A — imagine/layouts](/framework/ai/sessions/2026/09/29/f5150091-9c1e-4500-90b0-7313b19a36a…
- [Sidebar — a brand over a TREE of links, resizable by its ow…](/framework/core/Sidebar/readme.md) — ## Use js new Sidebar({ brand: "LEW42", app: this.app, root: this }) .ac("basis").style("--basis", "var(--sidebar)"); root: <a real Page> w…

## Owner asks
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, landed)
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)

## Commits
- 2e7bd5f49 review-site-pages: catalog goes wide and links InstanceTree; FigSelect no longer scrolls the page or closes t…
- 13754e1c9 docs: one-dictation docs pass (chat.js, Session markers, drawer)
- 9cf225e03 Course correction: a stalled ask is an Inbox row, not a second view
- 2f2cf44fd core/Page/navigation/: review fixes + connect-the-dots + familiar-structure pass
- 8f173f377 create_page does the whole mechanical job (description, readme stub, parent context); page-size report; page.…
- a4d3b79a0 Dictate: real mic feedback + subclassable variants (deliverables 3-4)
- 9891431cc Fix review findings: variant C consistency, walkthrough counts/links, H1 order, floating nav/page sizing, rai…
- 67eb7d4ee The page decides where a clicked link opens

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: Nav links: every page this week can be clicked to

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Nav links: every page this week can be clicked to"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
