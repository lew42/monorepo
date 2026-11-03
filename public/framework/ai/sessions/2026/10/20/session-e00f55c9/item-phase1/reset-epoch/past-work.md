<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Item List Phase 1  a reader recovers when its log is rewritten under it  reset     epoch    gap check " (words: item, list, phase, reader, recover, when, log, rewritten, under, reset, epoch, gap, check)

## Tasks (8, best first)
- 2026-10-03 [Store.js: a dragged move nests under its list's own name, not flat](/framework/ai/sessions/2026/10/03/list-events/move-nesting-fix/) — One line down from Draggable, not inside it — core/Item/Store.js's hops() dropped a list's own name whenever a change was the list's own add/remove/move/order. drags write top-level {"move":{...}} — fixed, now nests under the list's name: {"content":{"move":{… · paths 1/1 exist
- 2026-11-01 [Item MVP: the persistence research, built into the real Item / List /…](/framework/ai/sessions/2026/10/31/session-e3fd9043/item-mvp/) — Merged into michael/dev on 2026-11-01 (merge 9e849d788, with integration/data-shapes-2). The Item / List / Page core was kept and fixed, as the research recommended: call lines and change lines replay the same, snapshots, the socket transport with acks, the F… · paths 2/2 exist
- 2026-10-20 [Servex agents: logs over messages, round 3 (prompts, items, skills, o…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/system-architect/) — Round 3: all five asks landed; old AI data is in the store and the worktree pool frees itself. [mastermind skill](/.claude/skills/mastermind/SKILL.md): handle every prompt at once; Refine is the future, not used yet [core/Item](/framework/core/Item/): items s… · paths 1/1 exist
- 2026-10-17 [Checkup: finding past work, salvage branches, Whisper log](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-past-work/) — Sessions search now matches digest tags (live, 163fa78d0); PastWork gained --brief (Haiku-searcher prompt with the readme chain) and --task (writes past-work.md beside a task), in the past-work skill; salvage top 5 set aside with a dated note, none deleted; a…
- 2026-10-07 [Token accounting: fixed the real undercount (144/145 project folders …](/framework/ai/sessions/2026/10/08/token-accounting/token-accounting/) — Found and fixed the real accounting bug, and planned the realtime sessions page. Found it — [findings.md](/framework/ai/2026-10-07/token-accounting/findings.md): a case-sensitive match hid 144 of 145 worktree folders from the cost ledger; readers fell back to…
- 2026-10-03 [core/Item+Page: no at key, List extends Item, id rules, all data in d…](/framework/ai/sessions/2026/10/03/list-events/drop-at-key/) — Four owner passes, one merge — [Item](/framework/core/Item/), [List](/framework/core/List/), [Page](/framework/core/Page/) drop the at key — get(key) resolves one name; nesting replaces the path; a line may be an array of deltas; old at lines still replay for… · paths 3/3 exist
- 2026-10-03 [core/Page: PageLog folded away, Page extends Item directly](/framework/ai/sessions/2026/10/03/list-events/page-no-log/) — PageLog is gone — Page extends Item directly (e7f5a714) the file/place/tab/settings verbs + the listing moved onto [Page](/framework/core/Page/): [Page.class.js](/framework/core/Page/Page.class.js) PageLog class deleted; Log.js is a one-line re-export for its… · paths 6/6 exist
- 2026-10-02 [page-on-item](/framework/ai/sessions/2026/10/02/page-extends-item/page-extends-item/page-on-item/) — 1 PageLog extends Item, on/emit/set routed through Item+Events, id=folder name, bubbles()=false -- shipped, plus a real bug fixed (naming() now actually sets this.id) ✓ · 2 Page keeps add/move/open/walk/find, only set+store collided and both are resolved (set… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 60 files
- [core/List](/framework/core/List/) — used by 32 files
- [ext/catalog](/framework/ext/catalog/) — used by 7 files
- [ext/ErrorLog](/framework/ext/ErrorLog/) — used by 5 files
- [ui/dialog](/framework/ui/dialog/) — used by 6 files
- [ui/item](/framework/ui/item/) — used by 12 files

## Docs and readmes
- [core/Item + core/List](/framework/audit/doc/core-Item-List.md) — Two files, 175 lines of JS together, and they are the base of the whole persistence stack — ext/Saver, ext/editor, ext/Panel, ext/Draggable…
- [Catalog — next: previews that load in under 2 s](/framework/catalog/doc/next.md) — The ask: "a preview on the catalog page is enough to see what it looks like" — the review's test was 40 previews in under 2 s. Today they a…
- [Item, List, Page: the class block](/framework/core/Page/doc/class-block.md) — > Old way (deprecated 2026-10-28): this page teaches or uses page.children; the replacement is page.pages (a List). Guide: [migration-child…
- [Proposal (not built): re-run a page when its files change, …](/framework/ext/ErrorLog/doc/page-watcher.md) — The owner, 2026-10-24: errors are logged per page and per module, so we know the moment one happens, and the goal is pages with zero errors…
- [Audits — the eviction list, and how a layout change gets ch…](/framework/styles/doc/audits.md) — Split out of readme.md. ## 6. The eviction list Narrowed by §12. This list was written when the base layer was "framework styles you might …
- [Is the raw Whisper reply saved? (checked 2026-10-17)](/framework/audio/Whisper/doc/raw-log.md) — Update 2026-10-20: Dictate now writes every reply to the WhisperLog bucket instead of Servex's whisper-raw log, so the [Whisper page](/fram…
- [Core — the eight classes under every page (listed under Mor…](/framework/core/readme.md) — New here? Read [doc/overview.md](./doc/overview.md) first: the whole core API as short pseudo-classes, and one change followed from click t…
- [The objects, and the two phase lists](/framework/ext/Collab/doc/collab.md) — ## The shape Collab one run: question, kind, cost, winner .members[] Collab.Member — id, model, files{phase → {file, cost, status}}, cost, …

## Sessions tagged with these words
- 2026/10/15 [Past-work log node script](/framework/ai/sessions/2026/10/15/session-d76f0d2e/) — kind/owner model/sonnet mod/server mod/ai/sessions task/past-work-log · $1.06
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/14 [Nav-model page with live demos](/framework/ai/sessions/2026/10/14/session-e9f013e5/) — kind/owner model/opus mod/core/page task/mastermind-repo-slim page/catalog · $13.00
- 2026/10/14 [Sessions grid next phase](/framework/ai/sessions/2026/10/14/session-7c2c3708/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim page/catalog · $2.49
- 2026/10/14 [Nav-model review](/framework/ai/sessions/2026/10/14/session-4ca78811/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim page/catalog · $0.82
- 2026/10/14 [Catalog previews thumbnail script](/framework/ai/sessions/2026/10/14/session-195f4e8b/) — kind/owner model/sonnet task/mastermind-repo-slim page/catalog · $1.53

## Owner asks
- 2026-09-30 Logs: unknown verbs on AI 2; the validator checks the schema; register experiment and rev… (mastermind-servex (10 PM task, item 12), queued)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-10-03 Servex: Playwright Chrome logged + reaped; one warm shared browser with check_page (task-mastermind-playwright-reap, building)
- 2026-10-12 Settle Item/List/Content/Page classes (asked 15x) (mastermind-page-content-unify, routed)
- 2026-10-13 Servex: Playwright Chrome logged + reaped; one warm shared browser with check_page (?, landed)

## Commits
- a487bdc3c brief: Item/List, finish Phase 1
- f5b3240fc chat-model s1: review round 1 fixes
- 79a690bab chat-model s1: Phase 0 fixes 2, 4, 5 (data-shapes/design/fixes.md)
- e2303b6b5 Object views: DefaultView, track(), the Page and App objects live

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Item/List Phase 1: a reader recovers when its log is rewritten under it (`reset` / `epoch` + gap check)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Item/List Phase 1: a reader recovers when its log is rewritten under it (`reset` / `epoch` + gap check)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
