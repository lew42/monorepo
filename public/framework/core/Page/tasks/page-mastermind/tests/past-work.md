<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Page tests  Store  List and streaming" (words: core, test, store, list, stream)

## Tasks (8, best first)
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-20 [core/Item: the store, dated index and query plan](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/) — The plan is written: [store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md). Not built yet. inventory: every writer and reader, file:line (section 1) class architecture: Dated + DatedFiles on Item.Store, with alternatives (section 2) … · paths 1/1 exist
- 2026-10-12 [Page parts: a page body as a streamed list of views](/framework/ai/sessions/2026/10/12/session-471f8c3b/page-slice/) — A page body is now a list of heading, text and card parts streamed from its own page.jsonl. Class architecture shown on the site: /framework/core/Page/parts/doc/architecture.md One page renders heading, text and card: /framework/core/Page/parts/ Add, move and… · paths 2/2 exist
- 2026-10-19 [AI dashboard: the Inbox is one list over the one state, with filter c…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard/) — The Inbox in [/framework/ai/](/framework/ai/) is now one list over state.json, with url chips: Live, New, Recent, Older, Needs you, and a Kind row. No agent writes anything; the list streams. one dashboard, no new page: the Inbox rail reads the state (DashSta… · paths 3/3 exist
- 2026-10-04 [Models tab: added a one-row-per-model catalog with live pricing and o…](/framework/ai/sessions/2026/10/04/models-page/models-page/) — Live on /framework/ai/ → System → Models, above the fold. A 17-row sortable table — provider, context window, $/M in/out/cached, our docs/reasoning/refine test scores, seconds, tokens in/out, and a "typical minion $" column — plus five notes on why reads are … · paths 2/2 exist
- 2026-10-03 [core/Item+Page: no at key, List extends Item, id rules, all data in d…](/framework/ai/sessions/2026/10/03/list-events/drop-at-key/) — Four owner passes, one merge — [Item](/framework/core/Item/), [List](/framework/core/List/), [Page](/framework/core/Page/) drop the at key — get(key) resolves one name; nesting replaces the path; a line may be an array of deltas; old at lines still replay for… · paths 3/3 exist
- 2026-10-03 [Store.js: a dragged move nests under its list's own name, not flat](/framework/ai/sessions/2026/10/03/list-events/move-nesting-fix/) — One line down from Draggable, not inside it — core/Item/Store.js's hops() dropped a list's own name whenever a change was the list's own add/remove/move/order. drags write top-level {"move":{...}} — fixed, now nests under the list's name: {"content":{"move":{… · paths 1/1 exist
- 2026-10-20 [test-temp-store](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/test-temp-store/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/test-temp-store/requirements.md

## Modules that exist now (files outside the module that import it)
- [core/List](/framework/core/List/) — used by 23 files
- [core/Test](/framework/core/Test/) — used by 0 files

## Docs and readmes
- [parts — a page whose body is a list of parts, stored as lin…](/framework/core/Page/parts/readme.md) — Live: [/framework/core/Page/parts/](/framework/core/Page/parts/) (seed, with an add, a move and a remove already appended) and [/framework/…
- [List architecture — every list announces its own changes, b…](/framework/core/List/doc/architecture.md) — List is the ordered collection behind an Item's children, for example item.items or page.pages. It is one class, [List.js](../List.js), tha…
- [List — the ordered collection that announces every change](/framework/core/List/readme.md) — Every List is live. There's one class, List — no separate event-less variant any more (the owner, 2026-10-02: "scrap LiveList everywhere… L…
- [Item, List, Page: the class block](/framework/core/Page/doc/class-block.md) — This is one code block of the three classes, read from the source on 2026-10-15 (core/Item/Item.js, core/List/List.js, core/Page/Page.class…
- [content is always a List: step 1, as built (2026-10-12)](/framework/core/Page/doc/content-list-step-1.md) — Step 1 of [content.md](content.md), "Design: content is always a List". Steps 2 and 3 (children) are not built. Live: [/framework/core/Page…
- [Inbox — one ranked list of what wants the owner's attention…](/framework/core/Page/ext/Inbox/readme.md) — An inbox is a list of rows (notes, questions, landed tasks, cards that wait on the owner) sorted by one number, Inbox.rank. There are two v…
- [One store, one dated index, one query: the plan (2026-10-20…](/framework/core/Item/doc/store-index-query-plan.md) — What this is: the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed …
- [Adoption: how parent stays one hop](/framework/core/List/doc/adoption.md) — Every Item owns exactly one List, built as new List({ owner: this }). The owner reference is the entire mechanism behind a rule that spans …

## Sessions tagged with these words
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/13 [Core List architecture](/framework/ai/sessions/2026/10/13/session-fa932cf9/) — kind/agent model/haiku mod/core/list docs/architecture · $0.21
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Voice-20261015 page-instance requirements](/framework/ai/sessions/2026/10/15/session-74c14268/) — kind/owner model/sonnet mod/core/page task/page-instance framework/sessions · $1.25
- 2026/10/15 [Live stream cards not updating in browser](/framework/ai/sessions/2026/10/15/session-1ca12342/) — kind/owner model/sonnet task/live-stream page/live-cards · $1.14

## Owner asks
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-09-30 Inbox: core/Page/ext/Inbox extension; AI 2 Inbox to /framework/ai/; Needs you a filter; L… (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, landed)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)

## Commits
- 648a05b65 task-folders: TaskMove.mjs moves day folders into the sessions store
- 9f66f0dbb core/Item, List, Page: drop the at key, List extends Item, id rules, data lives in data
- 4aa3a71ca core/Task: a DOM-free unit of work — the base state-machine class

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: core/Page tests: Store, List and streaming

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Page tests: Store, List and streaming"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
