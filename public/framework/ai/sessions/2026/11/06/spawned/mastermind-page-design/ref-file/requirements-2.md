# Live: page.items saves an item in its own file (replaces requirements.md)

Budget: $8. Same worktree and branch as before: C:/Code/lew42/worktrees/pd-ref-file (worktree/pd-ref-file). Card: /framework/ai/2026/11/06/live-a-ref-card-loads-and-tails-a-loose/.

## Why the change
The owner dropped "a Ref with a file". A Ref stays a path inside what is already loaded (list → id → list → id). Your saved diff (`dropped-ref-file.patch`) is reference only; do not reapply it.

## The design (read it first, it is the spec)
The card "page.items: where each item is saved" on /live/plan/ (`public/live/plan/page.jsonl`, id `ov-items`). In short:
- A page has an `items` List. `items.add({...})` with neither field = embedded (a line in page.jsonl, as today for content).
- `file: "thing.jsonl"` → the item's lines live in that file beside the page. `path: "thing"` → `thing/page.jsonl`. Both → `<path>/<file>`. Resolved against the folder of the page's own file.
- page.jsonl keeps only a short line `{id, file}` (or `{id, path}`). Its id defaults to the file name without `.jsonl` (`thing`).
- `item.load()` returns the shared live object: `Item.open(url)` (already one root per url via `Store.for`), so the same file reached from two places is ONE object (dedup). `item.file_url()` returns the url, or null when embedded. Put these two methods where any Item list member gets them (core/Item), unless you find a reason not to; say it in a log line.
- Its class: the file's own line-1 `type`/`class`, else the class of the page that lists it (the folder's class; /live/ pages are LivePage).
- LivePage draws its `items` after its content: each loaded item's title and content, and tails the file (a write shows within 2 s, no reload).
- Route `/live/item-test/thing` (no trailing slash) opens that item as a LivePage. You found `LivePage.child()` (`public/live/LivePage.js:148`) has no branch for it; add one that looks the segment up in `items` first.
- The folder for `path` is made on the first write by the item tool (`Servex/agents/page_tools.js`); the browser never creates files. The item tool also builds a loose `/live/item-test/thing.jsonl` as LivePage, inheriting from its folder's page.jsonl `class` (the old ask 3, still wanted).
- Your Ref finding (`Ref.folder()` climbing `root()` to a `/` url) means: resolve against the LISTING page's own file url, not `root()`.

## Where `items` comes from
Check first how `content` / `pages` / `screens` become Lists on a LivePage (List.named, a getter, or hydrate). `items` should be the same kind of List; if a bare `{"items":{"add":…}}` line on a page with no declared list would be stored as plain data, that is the gap to fix.

## Done means
- Headless proof on your worktree server (Playwright `file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`): add ONE line `{"items":{"add":{"file":"thing.jsonl"}}}` to the worktree's `public/live/item-test/page.jsonl`; /live/item-test/ shows "Thing" and its content; append a line to thing.jsonl and it updates within 2 s; /live/item-test/thing renders `.live-page`. A second page listing the same file gets the same object (a node test can prove this: `a.load() === b.load()` resolved). Shots and probe output in this folder.
- Node tests: a new check in core/Item tests (embedded vs file vs path url, dedup); item_tool test for the loose file as LivePage and the `path` folder made on write. Green: core/Item, core/List, core/Page, item_tool, page_tools. `node Server/smoke.mjs` clean on /live/item-test/.
- Docs in the same commits: core/Item/readme.md (one line: items saved in their own file), public/live/readme.md (a row "an item in its own file").
- `LivePage.js` belongs to `mastermind-live-page`: keep the edit small and send it one line on what changed. A Servex restart is needed for the item-tool part; say so, never restart it yourself.
- Commit by exact path; `git add -f` under public/live/ (gitignored). Log lines in this folder's session.jsonl. Do NOT touch the main tree; the mastermind adds the one line there after the merge.

Never: restart or kill the dev server or Servex, drive the owner's tabs, `git stash`, or merge into compliance/dev.
