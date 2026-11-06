# Item tool: read a dotted path, refuse read-only verbs, build the page's own class

Budget: $8. Load the `minion` skill first. Model: Sonnet. Parent: mastermind-live-page (task dir one level up). The owner's words came in through the voice app; the proposal you are building is the last item in `../../mastermind-live-page/session.jsonl`, and also `public/framework/core/Page/improvements.jsonl` (ids `e3hc6m5g` and `ecof6xr5`).

## Why
Agents (the voice app above all) drive pages with the Servex `item` tool. They cannot read one part of a page: `{"get":"content"}` was appended to `/live/page.jsonl` as a log line and answered nothing. Also the tool replays a `page.jsonl` whose line 1 says `"class":"./LivePage.js"` as a plain `Page`, so it lists Page's methods and stores method keys (`toggle`, `flash`, `press`) as data.

## Build (all in `Servex/agents/page_tools.js`, plus its tests and docs)
1. **`read` parameter.** `item({path, read: "content.today"})` writes NOTHING. It replays the file's live root (the same `live_root(Class, file)` a write uses) and walks the dotted path one `get()` per step, as a line does (`Item.set_one` splits dots the same way). It answers `{ok:true, read, value}`:
   - an Item: its `toJSON()`, but every List inside it is replaced by rows (below);
   - a List: `{total, rows:[{id, type, title}]}`, where title is `title ?? label ?? text` cut to 80 characters;
   - a plain value: as is.
   The answer is capped at about 4 KB of JSON. Past the cap, cut it and say `truncated: true` plus a hint to read a deeper path. A path that does not resolve answers `{ok:false, why:"no such path: <the first missing step>", here:[the ids or keys that do exist at the last good step]}`. `read` with a `delta` in the same call is refused.
2. **Refuse read-only methods as deltas.** A delta that names `get`, `find`, `toJSON`, `walk`, `root`, `contains`, `member` or `locate` as a key, at any depth, is refused before anything is written: `"<key>" only reads; use read:"<path>". Nothing was written.`
3. **Build the class line 1 names.** `class_of(file)` already returns line 1's `class` (e.g. `"./LivePage.js"`); `class_for` ignores a module path. For a `page.jsonl`, resolve the path against the file's folder, import it (after `page_class()` has registered `site-hooks.mjs`), and use it if it extends Page; else fall back to Page with one `console.warn`. `paged` must then mean "Page or a subclass", not `=== Page`. Cache per absolute module path; say in a comment that an edit to the class needs a Servex restart. Proof: `public/live/LivePage.js` already imports in node (`register(site-hooks)` then `import()`); `item({path:"/live/"})`'s `instructions.class` must say `LivePage`, and its methods list must include `toggle`, `flash`, `alert`.

## Tests and proof
- Add `Servex/agents/item-read.test.mjs` (the core test pattern: one file, an assert per call, under 1 s). It must cover a read of an item, a list, a missing path, the 4 KB cut, a refused `{"get":"content"}`, and line-1 `LivePage` (copy `/live/page.jsonl` into a temp folder; never write the real one).
- Run `node Servex/agents/item_tool.test.mjs`, `node Servex/agents/page_tools.test.mjs` and `node Servex/agents/item-generic.test.mjs` before and after; report pass counts in `task.jsonl` as `log` lines.

## Fences
- Yours: `Servex/agents/page_tools.js`, the new test, `Servex/doc/item-tool.md` (add a "Reading a path" section) and the item tool's description text.
- Not yours: `public/live/*` and `public/framework/core/Page/doc/ai-api.md` (the parent is editing them).
- **Never restart Servex or the dev server.** The live Servex loads your code only after a restart, and a restart drops the owner's voice call. Say in your landing line that it needs a restart; the parent schedules it.
- Never `git stash`. Commit only your own files, by exact path, on `compliance/dev`.

## Done means
Tests pass, the docs section is written, and one commit is made. Then a landing line in `task.jsonl`: what works, the pass counts, "needs a Servex restart", and anything left open.
