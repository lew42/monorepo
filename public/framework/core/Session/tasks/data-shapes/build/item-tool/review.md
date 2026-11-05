verdict: fix
1. [fix] A stale comment says the opposite of what the code now does: `Servex/agents/page_tools.js:518` `slug_of` still says "a string added in the browser gets the same id", but `Task.List.make` now gives a string add an `Item.short_id()`. Reword it to say the slug is only a folder name (as `Task.js` already does).
2. [fix] The same-title rule is written twice: `same_title` in `Servex/agents/page_tools.js:516` is a copy of `Improvements.same` in `core/Task/Improvements.js:23` (law 6). Put it in one place, for example `Task.same_title`, and have both call it.
3. [note] Not every special case moved into a class verb. Only the verdict strings (`Task.replay_line`) and the improvements reinforce (`Improvements`) moved. Adding a task with its folder, `move`, `folder` and `pages` are still in `run_item_now`. Each is listed with where it goes in `Servex/doc/item-tool.md`, "Special cases still in the tool", which is what ask 3 allows when time runs out.
4. [note] The reviewed patch stops at 8961c6eea, but the branch has moved on (`worktree/item-generic`, now at b2649a4aa). The later commits add `LIVE_CAP`, let a browser page line be written, and revert the 162 `files.jsonl` noise rows that 8961c6eea had swept in. I ran the tests on b2649a4aa.
5. [note] The tests still write rows into tracked repo files on every run. After my run, the worktree had new `zz-item-tool-test-46096` rows in `public/framework/files.jsonl` and a line in `public/framework/ai/sessions/task-moves.jsonl`. This happened before this branch too, but it is what fed the noise into 8961c6eea.
6. [note] `Servex/agents/PromptLines.test.mjs` fails 2 of 8 checks (`add_question`, `roots()`). It fails the same way on `worktree/one-writer`, so this branch did not cause it. Still, ask 5 says "`Servex/agents/*.test.mjs` passes", and the landing should say this one fails.
7. [note] When a key matches both a data field and a child id, the data field wins: `hop()` (`Servex/agents/page_tools.js:937-939`) tries `node.get(key)` before `member(key)`, so a field holding an object hides a child with the same id. Random ids make this unlikely.

## Requirements
- 1 "One live root per file, for any registered class; a page write applies one line to its live root" — yes — `class_for` + `live_root` for every kind. `put()` calls `try_line` on the live page. `page_refusal` no longer replays the whole page. `item-generic.test.mjs` checks "zero replays".
- 2 "The address is the dotted path; target walks any list through each level's own get" — yes — `hops`/`hop`/`walk`/`node_at` in `page_tools.js`; three-level dotted set tested.
- 3 "Move the special cases into class verbs… list the rest" — partly — 2 of the named cases moved (verdict strings, reinforce), each its own commit (0e5f4c13a, a50a89407); the rest are listed in `Servex/doc/item-tool.md` (finding 3).
- 4 "The tool stops making ids from titles; 8 random characters; existing ids untouched" — yes — `Item.short_id()`, used by `stamp_ids`, by `tasks.add` and by `Task.List.make`. Explicit ids are kept, and an id with a dot is refused.
- 5 "Tests pass; add page set/add via live root, task by verb, dotted three deep, random id" — yes, with one exception — `item-generic` 22, `item_tool` 115, `session_tasks` 13, `verb-note`, `requests` 6 and `session-task` 14 all pass. 51 of the 52 `Servex/agents/*.test.mjs` pass; `PromptLines` fails, and it already failed on the base branch (finding 6).
- Class with live instances — n/a. `Improvements` is a new class, but its instances are `improvements.jsonl` files, which the item tool already reads (`item({path})`); there is no new state that needs a watch page.
- Fences — yes — not merged. The dev server url is logged (`item-tool.localhost`, port 62468). The branch name changed to `worktree/item-generic`, and the log says why (session.jsonl line 2).
- Docs current — yes, except finding 1 — `Servex/doc/item-tool.md`, `core/Item/readme.md`, `core/Item/doc/map.md` and `core/Task/readme.md` are updated, and `Improvements.js` is indexed in the Task readme's "More".
- Could a fresh agent continue from the folder alone? — yes — `session.jsonl` names the worktree, the branch, the commits and the url; `item-tool.md` lists the work left.

## Words
- Plain, full sentences — yes — the `item-tool.md` additions and the readme lines explain each change and why.
- Owner's names — yes — "live root", "dotted path" and "verb" are the words of the requirements and of ids-and-paths.md.
- Stale words — no — `page_tools.js:518` (finding 1).
