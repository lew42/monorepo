<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Item tool  refuse a line the page refuses  before appending it" (words: item, tool, refuse, line, refus, before, append)

## Tasks (8, best first)
- 2026-11-06 [Item tool: read a dotted path, refuse read-only verbs, build the page…](/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/item-read/) — Three asks, all in [page_tools.js](/Servex/agents/page_tools.js), commit faf01c784: Read a dotted path with no write: item({path, read:"a.b.c"}) answers a List as rows, an Item as its JSON, capped near 4 KB. A missing path names what exists. Proof: [item-read…
- 2026-10-25 [Voice sessions: filed in the dated store, costed, Opus 5.5 smart agen…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/voice-sessions/) — Voice sessions are filed, indexed and costed; the smart agent is Opus 5.5 and keeps its own record. Filed, indexed, shown with cost: v-dwlaoin, 2 child agents, $0.24 total: [shot at 1920](proof/sessions-list-1920.png) Backfill by script: 61 records moved, [ma…
- 2026-10-13 [Record files: a plain git merge dropped appended lines](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/task-log-race/) — Cause found, fixed, guarded, recovered. - ✅ Writer: a plain git merge --no-ff run in the dirty main tree at 17:38:07 (git parks the tree, hard-resets, the put-back failed). Not an autostash, not append.mjs, not LogSweeper; committed history never lost a line.…
- 2026-11-02 [Item/List: Phase 1 finished (all five items)](/framework/ai/sessions/2026/10/20/session-e00f55c9/item-phase1/) — Item/List Phase 1: all five items landed on michael/dev. Only Room + FileJournal remain ([status](/framework/core/doc/status.md)). unset: one line, replays, also snapshot + tail ([unset.test.mjs](/framework/core/Test/view/?file=core/Item/unset.test.mjs)), 244… · paths 1/1 exist
- 2026-10-15 [Servex: file and shell tools for the voice app](/framework/ai/sessions/2026/10/16/voice-20261016/remote-tools/) — The voice app can read, write and edit files and run shell commands once Servex restarts. Six tools (read_file, write_file, edit_file, list_dir, glob, shell) sit in the one Servex tool registry, rooted at the monorepo or a named worktree; .jsonl writes are re…
- 2026-10-03 [core/Item+Page: no at key, List extends Item, id rules, all data in d…](/framework/ai/sessions/2026/10/03/list-events/drop-at-key/) — Four owner passes, one merge — [Item](/framework/core/Item/), [List](/framework/core/List/), [Page](/framework/core/Page/) drop the at key — get(key) resolves one name; nesting replaces the path; a line may be an array of deltas; old at lines still replay for… · paths 3/3 exist
- 2026-10-02 [Delete guard: rm -rf in the main checkout is refused](/framework/ai/sessions/2026/10/02/delete-guard/) — What landed: git-guard.mjs now refuses a recursive delete whose target is inside the main checkout, from any cwd, and any delete fed by git status / ls-files output run in main. Worktrees, the scratchpad, %TEMP% and /tmp stay open; deleting one file by its ex…
- 2026-10-02 [core/Item: Page extends Item, live lists saved line by line](/framework/ai/sessions/2026/10/02/page-extends-item/page-extends-item/) — Page extends Item; lists save as lines (e44930ad) ![](/framework/ai/2026-10-02/page-extends-item/shots/live-second-tab-1920.png) one set(delta), replay flag: headless replay, add/add/move every page keeps working: smoke of 7 pages, 0 errors static Store, appe… · paths 4/4 exist

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 71 files
- [ext/DesignTool](/framework/ext/DesignTool/) — used by 32 files
- [ext/Timeline](/framework/ext/Timeline/) — used by 5 files
- [ui/item](/framework/ui/item/) — used by 12 files
- [ui/timeline](/framework/ui/timeline/) — used by 9 files
- [ui/toolbar](/framework/ui/toolbar/) — used by 9 files

## Docs and readmes
- [One writer: every record line goes through one entry point](/framework/core/Item/doc/one-writer.md) — What it is. Every line written to a record file (session.jsonl, task.jsonl, page.jsonl, improvements.jsonl) goes through one function, reco…
- [The item system: every class, store, tool and writer that m…](/framework/core/Item/doc/map.md) — An item is a thing kept as one JSONL log: line 1 says what it is, later lines are deltas, Item.set(delta) replays them. The same class runs…
- [app.navigated?.() — built. page.entered?.() — refused.](/framework/core/Router/doc/navigated.md) — Six independent seats asked for "something that runs after a navigation." Three wrote the line, and the three lines were not compatible: th…
- [The line format: data, name() and #id (D13)](/framework/core/Item/doc/line-format.md) — A saved line tells three things apart by how a key is spelled. The owner decided this on 2026-10-30 (research design/decisions.json D13). T…
- [How a line travels: out, ack, in, catch-up](/framework/core/Item/doc/transport.md) — What this is. An item's change is one line in a .jsonl file. This page follows that line from the tab that made it to every tab that shows …
- [Timeline architecture — CSS-positioned items in greedy lanes](/framework/ext/Timeline/doc/architecture.md) — Timeline is a general h/v timeline that renders dated items as bars and dots, entirely positioned via CSS custom properties (--t start, --d…
- [Timeline — a general h/v timeline (CSS-var positioning, gre…](/framework/ext/Timeline/readme.md) — ## Use js import { Timeline } from "/framework/ext/Timeline/Timeline.js"; new Timeline({ orientation: "h", zoom: 6, items: [ { from, to, la…
- [The Item system: what's built, what isn't, what's next (202…](/framework/core/doc/status.md) — In one line: the save-and-stream work from the persistence research is in the real classes on compliance/dev, about half of the planned Pha…

## Sessions tagged with these words
- 2026/10/15 [Remote full registry](/framework/ai/sessions/2026/10/15/session-d75b6d76/) — kind/agent model/sonnet work/read-only task/remote-full-registry servex/remote-tools · $0.14
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-9e1dd563/) — kind/agent model/sonnet work/read-only task/usage-pace-line docs/usage · $0.14
- 2026/10/15 [Voice MCP directives](/framework/ai/sessions/2026/10/15/session-92760713/) — kind/owner model/sonnet mod/servex task/voice-mcp-directives servex/remote-tools · $0.35
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-8f866486/) — kind/owner model/sonnet work/read-only task/usage-pace-line framework/ai · $0.34
- 2026/10/15 [Remote full registry](/framework/ai/sessions/2026/10/15/session-81909a47/) — kind/owner model/sonnet task/remote-full-registry servex/remote-tools · $1.11
- 2026/10/15 [Clarity remote tools](/framework/ai/sessions/2026/10/15/session-6c354292/) — kind/agent model/sonnet work/read-only task/remote-tools framework/digest · $0.15

## Owner asks
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-10-03 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (task-mastermind-framework-home-grids, building)
- 2026-10-13 Framework home: grids without voids, explicit layout classes, layout labels, DevTools inl… (?, queued)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard, queued)
- 2026-09-30 Icons: frames, buttons, rails, icon items aligned (task-mastermind-icon-system, building)

## Commits
- f11fb8386 live: doc which Page features voice can drive (tabs, columns, place, nav, previews)
- 4d9f8d329 live: doc which Page features voice can drive (tabs, columns, place, nav, previews)
- faf01c784 Item tool: read a dotted path, refuse read-only verbs, build the page's own class
- b7ec0b29c Pages stream and save on the owner's tunnel: page.jsonl tails wherever the dev socket opens; the key-gated tu…
- 2a56f0fae ask7 review fix 4: a repeated question links to its existing card, nothing else dropped
- 65366dc88 ask7: a repeated Question links to its existing card instead of a second one
- ceaffb16d item tool: one live root per file for any registered class; a page write applies one line to its live Page (n…
- 0dabbe1bf voice assistant: let the item tool write {place} lines to a Session (it refused them as an unknown key, so 0 …

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,988 tokens of reading, under the 100k limit).

Question: Item tool: refuse a line the page refuses, before appending it

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Item tool: refuse a line the page refuses, before appending it"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
