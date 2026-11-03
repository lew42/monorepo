<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Page parts   part view  and  part file  two new content types a page jsonl line can add" (words: core, part, view, file, two, content, typ, jsonl, line, can)

## Tasks (8, best first)
- 2026-10-15 [core/Page: subpages are page.jsonl lines, never page.js edits](/framework/ai/sessions/2026/10/16/voice-20261016/subpages/) — core/Page: subpages are page.jsonl lines, never page.js edits — closed out by mastermind-task-closeout: the task's own log says it finished and names its commit, but no landing line was written. Cost $1.34 (session 0c3e83dd). The log has the details.
- 2026-10-02 [core/Page/ext/Inbox: one class Inbox, two statics Rail + Compact](/framework/ai/sessions/2026/10/02/panel2-sessions/panel2-sessions/part1b-inbox-restructure/) — One class Inbox, two lazy views — inbox.rail and inbox.compact. Inbox.Rail = today's InboxRail (moved, unedited, into Rail.js's renamed Rail class, assigned as a static) — [Inbox.js](/framework/core/Page/ext/Inbox/Inbox.js) Inbox.Compact = new class merging D… · paths 6/6 exist
- 2026-10-20 [Sessions views: plan and a three-variant prototype (nothing built)](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/sessions-views/) — Plan and prototype ready for your pick; the real pages are unchanged. see the session view with its tasks, three ways, real data: [prototype](/framework/ai/sessions/doc/variants/) (shot at 400, 1920, 3440) segmented, nested progress bar: one shared SegBar, al…
- 2026-10-12 [Page: part-link cards, promote script, #id scroll](/framework/ai/sessions/2026/10/12/session-78a7b293/part-link/) — A page block can now become its own page, and the parent keeps a link card. Merged into michael/dev (56d44968f). a part-link content kind: [demo](/framework/core/Page/jsonl/part-link-demo/), doc [part-link.md](/framework/core/Page/doc/part-link.md) and the ai… · paths 2/2 exist
- 2026-10-12 [Page: jsonl replay and files move to Jsonl.js (split complete)](/framework/ai/sessions/2026/10/12/session-1c7d9e04/page-split-3/) — The Page.class.js split is complete — the jsonl loader and file steps now live in [Jsonl.js](/framework/core/Page/md/doc/split-plan/), and Page.class.js went from 2270 to 849 lines. Reviewed: 1 fixed, 4 noted ([STATE](/framework/ai/2026-10-12/page-split-3/md/… · paths 0/1 exist, gone: framework/core/Page/md/doc/split-plan/
- 2026-10-12 [Page parts: a page body as a streamed list of views](/framework/ai/sessions/2026/10/12/session-471f8c3b/page-slice/) — A page body is now a list of heading, text and card parts streamed from its own page.jsonl. Class architecture shown on the site: /framework/core/Page/parts/doc/architecture.md One page renders heading, text and card: /framework/core/Page/parts/ Add, move and… · paths 2/2 exist
- 2026-10-12 [Page content: pages, content, PagePart — one way each](/framework/ai/sessions/2026/10/12/session-8e24c457/page-content-unify/) — Page content simplified (merge c1b8bfe6f). Plan and counts: [content.md](/framework/core/Page/doc/content.md); state: [STATE.md](/framework/ai/2026-10-12/page-content-unify/md/STATE/) items draw through their class View: parts page renders at 400/1200/1920/34…
- 2026-10-03 [Content rows: a row can BE a page reference, drawn as its dark class …](/framework/ai/sessions/2026/10/03/list-events/ref-content-rows/) — Landed: a content row with ref draws as that page's own dark class card (#Mention's exact look, reused), linking to it, with the row's own text under it. the look + link: proven live on the Now card's new "Page" row text under the card: same row, same screens… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/View](/framework/core/View/) — used by 302 files
- [ext/files](/framework/ext/files/) — used by 23 files
- [ext/filesystem](/framework/ext/filesystem/) — used by 30 files
- [ext/JSONL](/framework/ext/JSONL/) — used by 49 files
- [ext/Timeline](/framework/ext/Timeline/) — used by 5 files
- [ui/timeline](/framework/ui/timeline/) — used by 9 files

## Docs and readmes
- [parts — a page whose body is a list of parts, stored as lin…](/framework/core/Page/parts/readme.md) — Live: [/framework/core/Page/parts/](/framework/core/Page/parts/) (seed, with an add, a move and a remove already appended) and [/framework/…
- [content — every shape a page's content can take, one child …](/framework/core/Page/content-shapes/readme.md) — Live: [/framework/core/Page/content-shapes/](/framework/core/Page/content-shapes/). The design: [doc/content.md](../doc/content.md), "Desig…
- [Extensions — a page.jsonl line turns a small piece of behav…](/framework/core/Page/ext/readme.md) — See it running: [this page](/framework/core/Page/ext/) — its own page.jsonl has one line, {"ext": "Inbox"}, and two {"inbox": …} messages. …
- [Page storage and streaming — one line in a file, one redraw…](/framework/core/Page/doc/streaming.md) — A page keeps its data in plain text files inside its own folder. Anything can add a line to one of those files, and every open browser tab …
- [Subpages: a page.jsonl line, never a page.js edit](/framework/core/Page/doc/subpages.md) — A subpage is made by appending a line to its parent's page.jsonl. No agent edits a page.js, and the old children: "a b c" string is not tou…
- [Who writes a line](/framework/core/Page/jsonl/doc/writers.md) — Seven things can add a line to a page.jsonl. None of them ever rewrite the file — every one of them only appends. | writer | what it append…
- [When a line lands, and when you see it](/framework/core/Page/jsonl/doc/timing.md) — Two different clocks matter here: when a line is WRITTEN, and when a reader's browser actually SHOWS it. ## When a line is written - A file…
- [Page — a folder with a page.js or a page.jsonl is a page: a…](/framework/core/Page/readme.md) — One system with Item: Page extends Item, so saving, replaying a log, set(delta) and live() tailing are the [Item readme](/framework/core/It…

## Sessions tagged with these words
- 2026/10/13 [Core view architecture documentation](/framework/ai/sessions/2026/10/13/session-84fff8e8/) — kind/agent model/haiku mod/core/view task/mastermind-repo-slim docs/architecture · $0.29
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-9e1dd563/) — kind/agent model/sonnet work/read-only task/usage-pace-line docs/usage · $0.14
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-8f866486/) — kind/owner model/sonnet work/read-only task/usage-pace-line framework/ai · $0.34
- 2026/10/15 [Voice-20261015 page-instance requirements](/framework/ai/sessions/2026/10/15/session-74c14268/) — kind/owner model/sonnet mod/core/page task/page-instance framework/sessions · $1.25

## Owner asks
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-10-12 Settle Item/List/Content/Page classes (asked 15x) (mastermind-page-content-unify, routed)

## Commits
- c4cc54660 Content-row rendering: card rhythm, live agent mentions, inline chip size
- 410077363 panel2-sessions Part 1: ext/panel2 (new standard UI chrome) + Inbox restructure
- e7d08a933 one-dictation/minion-core: review fixes — revert core Router nav change for a smaller rail.js fix, close a st…
- e0ca27f80 Fix round 2, Part X follow-up: refresh_nav() must reveal(), or a cold load's own rail expansion gets erased
- 1bd278a93 Fix round 2, Part X: one nav rule, no blind probes, tabs redraw live
- 8b76ccc71 Fix round 2, Part Y: loading strip on the Overview, page_work() walks the real page tree
- 07206a834 Object views: answer the fresh-eyes review (6 fixed, 1 declined, 2 noted)
- e2f651ec1 core/Page/ai/: one tile set, and a filtered live-agents widget

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: core/Page parts: `part-view` and `part-file`, two new content types a page.jsonl line can add

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Page parts: `part-view` and `part-file`, two new content types a page.jsonl line can add"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
