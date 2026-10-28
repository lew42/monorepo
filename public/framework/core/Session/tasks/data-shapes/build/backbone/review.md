verdict: fix
1. [fix] The F1 study is unindexed and its fork is stale: `data-shapes/plan.md:23` (F1 row) still says "Needs a study (step 1c)", and nothing on the branch links `build/backbone/f1-live-instance.md` except requirements.md. Link the study from the F1 row and write its answer there (each project's dev server).
2. [fix] `core/Item/doc/architecture.md:93` still describes the old line shape: "then `{"k":{"set":…}}`". Since this branch the line is `{"kids":{"k":{"set":…}}}`, and line 97 of the same file now contradicts line 93.
3. [fix] `core/Item/doc/next.md:3` still briefs `set(prop, item)` adoption as unbuilt ("the child is never adopted… keep the known-gap assertions"). This branch built it and flipped those tests, so mark the brief done or move it aside.
4. [fix] The wire changed but its doc didn't: `Tail.js` `send()` now passes `jsonl(path, lines, offset, from, ends)`, and `public/framework/dev/Socket/doc/wire.md:125` still documents only `lines` and `offset`. Add `from` and `ends`, and what `live.js` does with them, plus the old-server fallback.
5. [fix] `Server/plugins/SocketServer/Tail.test.mjs` is a new test that no readme lists. There is no SocketServer readme, `Server/readme.md` doesn't mention it, and wire.md doesn't either. Index it next to the wire doc (law 10).
6. [note] `List.find` now trusts its Map. A caller that changes `list.items` in place (push, splice, sort) without going through a List verb would make `find()` return `undefined` for a member that exists (`List.js` find: "hit undefined and no unkeyed, so return undefined"). A grep of the worktree found no such caller outside List.js. A one-line warning at `get items()` would protect the next caller.
7. [note] `Item.set_one` now splits any new dotted key into a path (`Item.js` set_one, first lines), and `Item.dots` does the same for every Task and Session line. So a data field whose name has a dot (`"readme.md"`, `"v1.2"`) can no longer be stored flat. No real file was affected (replay-compare showed no difference), but nothing documents the limit.
8. [note] The `lists()` cache is checked by how many own keys the item has (`Item.js` lists()). An existing List, already owned by the item, that replaces a non-list field keeps the same count and is missed. This is rare, but a version counter on assignment would be exact.
9. [note] The brief's proof lines are met with caveats, all of them logged in session.jsonl. The voice session v-sq8y7db replays in 199 ms against a 200 ms bar, from one run. The suite is 118/120: PromptLines and layers fail on the base too. smoke fails the core/Item doc pages and ai2 with the same 6 warnings as michael/dev. The landing line should state these, not "passes".
10. [note] The replay comparison is described only in the task log, as prose: 5083 files, all identical once the by/ts stamps are left out. The digest files were left in %TEMP%. Committing the two digest .jsonl files, or the `--compare` output, beside `replay-compare.mjs` would let a fresh agent check the claim without rerunning it.
11. [note] SessionTasks applies only new lines for record-shape sessions (tabs and voice). A spawned agent's task-shape record is still replayed whole on every batch (`SessionTasks.js` read). The readme says so, but brief 1a asked for "applies new lines only" without that limit, so the gap should be filed as a follow-up task.
12. [note] Old id-only hops warn only in node, and only once per process (`Item.js` set_one, key `member-hop`). The browser counts them in `Item.old_hops` without warning, which differs from the brief's "with a warning"; the task log gives the reason. The comment says "the item tool can report them", but no tool reads `Item.old_hops` yet. Docs still teach the id-only form, which now warns in the item tool: `core/Item/readme.md:81` and `architecture.md:121-122` (`{"<id>":{"move":…}}`).
13. [note] `delta-flow.test.mjs` runs a demo inside a task folder (`core/Session/tasks/data-shapes/seats/delta-flow/demo-delta-flow.mjs`) and passes when that demo prints "STALE". If the seat folder is archived or the demo's text changes, a core test breaks. The seat's notes still list B2–B10 as open.
14. [note] Brief 1b asked for "one X.test.mjs per class where it fits"; the build made one matrix file, `persistence.test.mjs`, and logged why. That is reasonable, its 82 checks pass, and the log says 25 cells fail on the old code. The "replay" column is just another change: every cell already replays.
15. [note] Small things in `Item.js`: `static get clock` and `static set clock` are split by `static dots` between them. `find()`'s index misses an item whose id changed to the queried id (only a stale hit is detected).

## Requirements
- 1a "every hop names its list" — yes — Store.js hops/list_name; Item.test.mjs two-lists case
- 1a "set() reads dotted path keys, each level's get taking the rest" — yes — Item.set_one/get, Item.dots; Item.test.mjs "kids.k"
- 1a "List keeps an id-to-member Map" — yes — List.js index/indexed/unindexed (see note 6)
- 1a "Item.get stops searching every list (old lines replay, with a warning)" — yes, partly — member() fallback; warning node-only (note 12)
- 1a "by/ts stripped into a clock for every Item" — yes — Item.replay_line, Item.clock; Page keeps them in jsonl_lines only
- 1a "set(prop, item) adopts, hops learns property names" — yes — adopt_slot, hops _slot; Item.test.mjs
- 1a "one offset per socket in Tail.js" — yes — Tail.js subs Map<socket, offset>; Tail.test.mjs fails on the old code
- 1a "linear replay: lists() cached, pseudo-property line no longer walks the tree, SessionTasks applies new lines only" — yes, partly — task-shape records still replay whole (note 11)
- 1a "old files replay identically, proven by a node script" — yes — replay-compare.mjs, 5083/5083 with stamps stripped; output not committed (note 10)
- 1b "persistence matrix, every persisting class, standalone and nested" — yes — persistence.test.mjs, 13 rows × 5 ops (note 14)
- 1c "F1 study: where, what each server owns, what moving takes" — yes — f1-live-instance.md; unindexed (finding 1)
- Fence "change no data shape" — yes — the writer's hop now names its list, which brief 1a requires; the only new reader is for dotted keys and Session's `{"set":…}`
- Fence "don't merge, don't restart, main tree untouched" — yes — branch worktree/backbone, not merged
- Fence "tests, smoke, v-sq8y7db < 200 ms" — yes, with caveats — 199 ms; the 2 failing tests and the smoke failures are the same on the base (note 9)
- Fence "run review.mjs, answer findings, land the log" — n/a — this review is that step; not landed yet
- Fence "write as you go, a fresh agent could carry on" — yes — session.jsonl logs every commit, decision and trap
- Class page for changed classes (Item, List, Session) — yes — existing class pages; smoke checked List, Task, Session and Page against michael/dev

## Words
- Readmes and docs plain and current — no — architecture.md:93, next.md:3, wire.md:125 and plan.md:23 are stale (findings 1–4); the new readme bullets are clear and say what changed.
