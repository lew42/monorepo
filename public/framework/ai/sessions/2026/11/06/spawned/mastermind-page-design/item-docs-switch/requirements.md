# Item tool, merge 7: switch the docs, skills and voice text to `get` / `set` / `call`

Budget: $5. Load the `minion` skill first, then the `documentation` skill.

**The ask.** The owner said yes on 2026-11-09 (via voice-app) to [/live/plan/item-tool/](/live/plan/item-tool/).
- Merge 1 landed (4f02044b2): the item tool takes `get`, `set`, `call` beside `delta` and `read`. Read "The three verbs" in `public/framework/core/Page/doc/ai-api.md` first.
- This merge rewrites the examples that teach agents the tool so new calls use the verbs. Old shapes stay as aliases, so it is wording only: no code behaviour changes.

## The translation

```js
item({path, read: "a.b"})                         → item({path, get: "a.b"})
item({path, delta: {title: "x"}})                 → item({path, set: {title: "x"}})
item({path, delta: {tasks: {add: {title: "x"}}}}) → item({path, call: "tasks.add", args: {title: "x"}})
item({path, delta: {start: {}}})                  → item({path, call: "start"})
item({path, delta: {tasks: {"t1": {complete: {…}}}}}) → item({path, call: "tasks.t1.complete", args: {…}})
```

A delta that does two things in one line (sets a field AND calls a method), or a teaching example *about* deltas (what a log line looks like), stays as `delta`. Add one short line beside it if that helps: "one line doing two things: `delta` still works".

**Is the key a method?** Methods are listed in the help the tool answers (`item({path, delta: {help: {}}})` → `instructions.methods`). Task's verbs are in `public/framework/core/Task/Task.js` (the CAN map, around line 14). When you're unsure, keep `delta`.

## Steps

1. **Census, written to a file.** Run:
   ```
   git grep -n -E "item\(\{[^)]*(delta|read)\s*:" -- '*.md' '*.js' '*.mjs' ':!*/sessions/*' ':!*/archive/*' ':!*/old/*' ':!*.test.mjs' ':!*/research/*' ':!*/proof/*'
   ```
   Today it finds about 49 files. Save the hits as `census.txt` in this task folder. Also search the voice text and role prompts that use other phrasings: `git grep -n -E "\bdelta: *\{" -- Servex/agents/*.md Servex/agents/roles .claude/skills`.
2. **Skip:**
   - `Servex/agents/page_tools.js` (the tool itself; its description already leads with the verbs);
   - dated owner-words docs (`owner-2026-*.md`): they are records;
   - test and proof files;
   - anything under `sessions/`.
3. **Rewrite the rest by hand,** one file at a time, using the table above. The most-read files come first, so cut from the bottom if the budget runs out:
   - `Servex/agents/roles/*.md`
   - `.claude/skills/*/SKILL.md`
   - `Servex/agents/session-smart.md`
   - `Servex/agents/single-voice-assistant.md`
   - `public/live/readme.md`
   - `Servex/doc/item-tool.md`
   - `core/Task`, `core/Session` and `ux/Dictate` docs
   - Server scripts' comments and prompts (`Server/UndoneToTasks.mjs`, `Server/PromptRecords.mjs`): only the text they send to a model or print, never their logic.
4. **Write a manifest,** `manifest.md` in this task folder: one row per file, giving the count changed, the count kept as `delta`, and why.
5. **Check:**
   - `node Server/doc-check.mjs public/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/item-docs-switch` (links);
   - `node Servex/agents/item-verbs.test.mjs` and `node Servex/agents/item_tool.test.mjs` still pass;
   - `node --check` on every .js/.mjs you touched.
   - Re-run the census and record the before and after counts in the manifest. Those are the two numbers I check.
6. **Commit** by exact path in your worktree, in a few commits by area (roles and skills, then docs, then scripts). **Do not merge.** This merge must wait until Servex has restarted onto merge 1, so the docs never teach a verb the running tool lacks. The mastermind merges.

## Fence

Text only, in the files the census finds, plus `census.txt` and `manifest.md` in this folder. Not `page_tools.js`, any test, `core/Item`, `core/List` or `core/Page/*.js`. Never kill or restart the dev server or Servex. Never drive the owner's tabs. Never `git stash`. rg is not installed; use `git grep`.

## Report

Write `{"log": …}` lines on your task (`item-docs-switch` in the session `/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/`). Then reply in under six lines: files changed, the census count before and after, the worktree and the commits.
