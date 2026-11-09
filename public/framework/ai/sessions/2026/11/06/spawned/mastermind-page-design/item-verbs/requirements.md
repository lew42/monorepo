# Item tool: add the verbs `get`, `set` and `call` (merge 1 of the plan)

Budget: $5. Load the `minion` skill first, then the `code` skill.

**The ask.** The owner said yes on 2026-11-09, relayed by voice-app: build the plan at [/live/plan/item-tool/](/live/plan/item-tool/). Read its cards "The three verbs" and "What leaves page_tools.js" in `public/live/plan/item-tool/page.jsonl`. This brief is **merge 1 only**: the three verbs go in *beside* today's `delta` and `read`. Nothing old changes or goes away. Old calls must keep working exactly as they do now, because running agents use them mid-turn.

## The verbs (what the agent writes, and the line it becomes)

```js
item({ path, get: "tasks.link-dot.state" })   // same as today's read: "…": no write, same answer shape
item({ path, set: { title: "Plans" } })       // → delta {title: "Plans"}; one line
item({ path, set: { "tasks.x.priority": 2 } }) // dotted keys allowed (the existing a.b shorthand)
item({ path, call: "tasks.add", args: { title: "x" } })     // → delta {tasks: {add: {title: "x"}}}
item({ path, call: "tasks.link-dot.complete", args: {…} }) // → {tasks: {"link-dot": {complete: {…}}}}
item({ path, call: "start" })                              // no args → {start: {}}
```

**The log does not change.** `set` and `call` build exactly the `delta` that today's caller would have written, then run today's write path, so validation, ids, `by` and `ts` stay the same. Write that translation as one small function (for example `verbs_to_delta(args)` → `{delta}` or `{read}` or `{why}`) at the top of `run_item_now` (`Servex/agents/page_tools.js:1533`), and change nothing below it.

**Refusals.** Each answers `{ok:false, why}`, writes nothing, and names the fix:
- More than one of `delta`, `read`, `get`, `set`, `call` in one call.
- `args` without `call`.
- `set` with a key that names a method or a child list (for example `start`, `tasks`, `content`): "`start` is a method; use call: \"start\"".
- `call` whose last step is not a method on what the path reaches; reuse the class's own callable list (the same data the help `instructions.methods` comes from).
- `call` on a query (`completion`, `summary`, anything in the help's `queries`): "`completion` only reads; use get".

## Also

1. **Schema and description:**
   - Add `get`, `set`, `call` and `args` to the item tool's input schema (around `page_tools.js:1844`).
   - Put one sentence at the front of `ITEM_DESCRIPTION` (`:467`): "Prefer the verbs: get reads, set changes fields, call runs a method; `delta` and `read` still work."
   - Find every other place the item tool's schema is declared (the `local` MCP the VS Code tabs use, and RemoteMCP if it copies the schema: `git grep -n "ITEM_DESCRIPTION\|name: \"item\"" -- Servex Server`). Give each the same params.
2. **Test, new file `Servex/agents/item_tool.test.mjs`:**
   - Make a scratch session in a temp dir, the way the existing page_tools tests do (`git grep -l run_item -- Servex '*.test.mjs'`).
   - One case per verb: `get` equals `read`; `set` writes the same line as the equivalent `delta`; `call` writes the same line as the equivalent `delta`.
   - One case per refusal.
   - It runs under 1 s. Also run the existing page_tools tests; all pass.
3. **Docs, in the same commit:**
   - `public/framework/core/Page/doc/ai-api.md`: a short "The three verbs" section at the top, with the snippet above, saying `delta`/`read` still work.
   - Each touched readme's line for the item tool.
   - Do NOT switch the other ~100 docs; that is merge 7.
4. **Live check:** the tool is Servex code, so it goes live only after a Servex restart. Do not restart it. Instead, prove it by test, and by calling `run_item_now` directly from a node script against a scratch copy.
5. Work in a worktree (`take_worktree`, or `node Server/worktree-up.mjs item-verbs`). Commit by exact path. Do not merge; the mastermind merges.

**Fence:** Servex/agents/page_tools.js (only the translation, the schema and the description), the other schema copies you find, the new test, ai-api.md, and readme lines. Not core/Item, core/Page/*.js or core/List (other agents are editing them now). Never kill or restart the dev server or Servex. Never drive the owner's tabs. Never `git stash`. rg is not installed; use `git grep`.

## Report

Write `{"log": …}` lines on your task (`item-verbs` in the session `/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/`). Then reply in under eight lines: the files changed, test counts, which schema copies you updated, the worktree, and the commit.
