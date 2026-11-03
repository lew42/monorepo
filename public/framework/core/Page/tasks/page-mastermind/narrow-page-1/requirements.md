Budget: $6

# core/Page: one helper per page, made once (a narrower Page, step 1 of 3)

Load the `minion` skill first, then `code`. This task's log is `session.jsonl` in this folder; findings go there as `log` lines (`node .claude/hooks/append.mjs <file> <json-array-file>`).

**Why:** plan step 7, [plan.md (c) "A narrower Page"](../plan.md), step 1 of its three. `Page.class.js` (772 lines) builds a new helper object on every call: 47 method bodies do `new this.constructor.X({ page: this })` and call one method on it (24 `Jsonl`, 10 `Columns`, 6 `Previews`, 4 `Links`, and one each of `Related`, `Prefs`, `Frame`). Step 1 makes each helper once per page, as a lazy property, with no change in behavior and no change for any caller. Steps 2 (move the statics into their own file) and 3 (callers use `page.log.tab()` directly, which is major surgery and waits for the owner) are not part of this brief.

## What exists (read these, nothing wider)

- `public/framework/core/Page/Page.class.js`: the forwarders (`grep -n "new this.constructor\." Page.class.js`).
- The seven helper classes it builds, each in `core/Page/` (`Jsonl.js`, `Columns.js`, `Previews.js`, `Links.js`, `Related.js`, `Prefs.js`, `Frame.js`). Read only their constructors and fields first.
- `public/framework/core/Page/doc/split-measure.mjs`: measures `Page.class.js` per method (`node public/framework/core/Page/doc/split-measure.mjs`).

## Do, one commit each

1. **Check each helper is safe to share.** A helper can be made once only if it keeps no per-call state: no field a method sets and a later call reads as if it were fresh. Log one line per class, `safe` or `not safe: <field, file:line>`. A class that is not safe stays as it is today.
2. **Build:** for each safe class, one lazy getter on `Page`, named for the class in lower case (`get jsonl(){ return this._jsonl ??= new this.constructor.Jsonl({ page: this }); }`), and the forwarders call it (`tab(...a){ return this.jsonl.tab(...a); }`). Keep `this.constructor.X`, so a subclass that overrides `X` still gets its own. Before you add a getter, check the name is free on `Page`, `Item` and every subclass of Page (`grep -rn "get jsonl\b\|\.jsonl =\|jsonl(" public/framework --include=*.js`); `Page.jsonl` is already a STATIC (the loader), and a static and an instance getter with the same name do not collide, but if anything reads `page.jsonl` as data, pick another name and log it. The `_` field must not be saved: check `toJSON()` (core/Item) skips it, or name it the way Item's other instance-only fields are named.
3. **Prove nothing changed:**
   - `node --check` the file; `node public/framework/core/Test/TestRunner.mjs public/framework/core/Page` and `... public/framework/core/Item` before your first change and after your last (log both counts; they must match).
   - Headless shots before and after of `/framework/core/Page/`, `/framework/core/Page/parts/types/`, `/framework/ai/sessions/` and `/framework/core/Events/` at 400 and 1920 (`import { browser, close } from "file:///C:/Code/lew42/monorepo/Server/Browser.mjs"`), into `shots/before-…` and `shots/after-…`. Compare pixel sizes, and look at any pair that differs.
   - Smoke from the main tree: `MSYS_NO_PATHCONV=1 node Server/smoke.mjs <your worktree> /framework/core/Page/ /framework/core/Page/parts/types/ /framework/ai/sessions/ /framework/core/Events/ /framework/core/Page/overview/columns/`, FAIL count before and after.
   - Two numbers that must agree: the count of `new this.constructor.` inside method bodies before (47) minus after, and the number of forwarders you converted.
4. **Doc:** one line in `core/Page/doc/architecture.md` (or wherever it lists the helpers) saying each helper is made once per page, and the getter names.

Log `ready: <branch> at <sha> <one line: converted N of 47, tests before/after, smoke before/after>`.

## How

- Work in the worktree named in the message that hands you this brief. Commit after each step.
- Never kill or restart the dev server or Servex. Headless only, never the owner's tabs. Never `git stash`. If `files.jsonl` churn shows in `git status`, leave it and commit only your files.
- **Resolve, don't park.** A forwarder you leave as it is gets a log line with the reason.
- If you run short of budget, cut step 4 first, then land only the classes already proven.
