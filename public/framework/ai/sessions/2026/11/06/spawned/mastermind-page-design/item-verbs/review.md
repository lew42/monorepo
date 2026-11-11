verdict: fix
1. [fix] The new test is unindexed: `Servex/agents/map.md:55` lists every `*.test.mjs` in the folder (`item-read.test.mjs`, `item_tool.test.mjs`, …), but not `item-verbs.test.mjs`. Add it there (Law 10). `Servex/doc/item-tool.md` already names it.
2. [fix] The task log is stale, so a fresh agent would be misled. `item-verbs/session.jsonl` ends with "Landed … (11 checks) … Commit 1e93b29d4", but the branch `worktree/item-verbs` also has a later commit, 500732cc3 (session 7caa4528: dotted `set` keys are checked at their last step). That commit has no log line, and the test now runs 12 checks. Add a log line naming 500732cc3, and make clear the merge must take both commits.
3. [note] The brief named the test file `Servex/agents/item_tool.test.mjs`, but that file already exists (148 checks), so the work went into a new `item-verbs.test.mjs`. That is the right call, but neither the task log nor the commit says so.
4. [note] Schema copies: there is only one. The `local` MCP (`item-local.test.mjs`) and RemoteMCP (`RemoteMCP.test.mjs:20`) both register `page_tools()`, so the new params reach every door. `git grep ITEM_DESCRIPTION` finds only `page_tools.js`. The minion's report should have said this explicitly instead of leaving it to the reader.
5. [note] `ITEM_DESCRIPTION` (`page_tools.js:467`) still opens with "`item({path, delta})`" and only then says "Prefer the verbs". To match the brief's "one sentence at the front", lead with `item({path, get|set|call})`.
6. [note] The `args` param (`page_tools.js` schema, `args:`) has no `type`. That is valid JSON Schema (any value), but it is the only untyped property among the tool's parameters. Worth a look if a client validator complains.
7. [note] The `call` query refusal reads `owner?.queries` from the constructor of the node the path reaches. For a List (e.g. `call: "tasks.summary"`), that is List's own `queries` (probably none), so a list-level query would fall through to the "not a method" refusal. Nothing is written either way, but the refusal names the wrong fix.

## Requirements
- Verbs `get`/`set`/`call` beside `delta`/`read`, old calls unchanged: yes. `verbs_to_delta()` runs at the top of `run_item_now`, and nothing below it changed. The old suites pass on the worktree: item_tool 148, item-read 48, item-generic 23, item-backbone 9. item-local fails in the worktree only with ERR_MODULE_NOT_FOUND (the worktree has no Servex node_modules); it passes in the main tree (6).
- `get` = `read`: yes. Test case 1 compares the two answers' JSON.
- `set` / `call` write the same line as the equivalent `delta`: yes. Test cases 2–5 cover `{title}`, `tasks.add` with args, `start` with no args, and a dotted key.
- The five refusals, each writing nothing and naming the fix: yes. There is one test case per refusal, and the file stays byte-identical across all of them. The `set`/`call` checks use `surface_of` and `node.lists()`, the same data `instructions.methods` comes from.
- Schema and description: yes. `get`/`set`/`call`/`args` are in the schema, and the sentence is in `ITEM_DESCRIPTION` (see note 5 on its position).
- The other schema copies: n/a. There are none; see note 4.
- The test: yes. A scratch folder in the same style as `item-read.test.mjs`, 12 checks in 589 ms.
- Docs: yes. `ai-api.md` has a "The three verbs" section with the snippet, `Servex/readme.md` has the item line, `Servex/doc/item-tool.md` has a paragraph, and no other docs were switched.
- Live check by test only, no restart: yes.
- Worktree, commit by path, not merged: yes. The work sits on `worktree/item-verbs` (1e93b29d4, 500732cc3).
- Fence: yes. The edits touch only `page_tools.js` (translation, checks, schema, description), the new test, `ai-api.md`, `Servex/readme.md` and `Servex/doc/item-tool.md`. No change touches core/Item, core/List or core/Page/*.js.
- Live instances of a new class: n/a. No class was added.

## Words
- The docs say what the verbs are before giving detail: yes. `ai-api.md`'s new section leads with one plain sentence, then the snippet.
- The refusal text names the fix: yes. For example `"start" is a method; use call: "start". Nothing was written.`
- Stale wording: no, apart from note 5 (the description still opens with the old shape) and finding 2 (the task log's check count and commit).
