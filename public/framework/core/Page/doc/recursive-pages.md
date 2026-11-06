# Recursive pages: every card is a page you can open

**The ask** (the owner, 2026-11-06, relayed by voice-app): every card on `/live/` should be a page you can tap into and design live, at any depth. Should "card" become "page"? Where does a card's data live once it is a page: in the parent's log, in a file beside it, or in its own folder? Can the Ref system stitch separate files back into the parent?

**The answer in one line:** a card's address never depends on where it is stored. Card `foo` on `/live/` is always at `/live/foo/`. It starts inside `/live/page.jsonl` and moves out to its own folder only when it needs files of its own; a Ref left in its place keeps the parent showing it.

## 1. Card or page?

A card *is* a page. It just doesn't need a new name to be one: what makes it a page is that it has a url and can be opened. `part-card` stays the name of how it looks inside its parent (title, a few lines, a tap target). Open it and the same page class draws it full size, with its own content list.

- **Alternative:** one class for both, so every card *is* a `Page` instance. Not now: Page carries about 150 methods ([namespaces.md](namespaces.md)), and a hundred cards would each carry them. Revisit once the UI methods have moved off Page.

## 2. Where a card's data lives

These are the same three shapes decision D9 already names ([files.md](files.md), section 1):

| Shape | On disk | When to use it | Status |
|---|---|---|---|
| **embedded** (default) | lines inside the parent's `page.jsonl` | almost every card: text, nested cards | **Built for `/live/` (2026-11-06):** `LivePage.route(name)` finds the card by id (`public/live/LivePage.js:121`). The item tool writes to `/live/foo/` through the nearest ancestor `page.jsonl` (`card_at` in `Servex/agents/page_tools.js`; voice gets it after the next Servex restart). |
| **own folder** | `/live/foo/page.jsonl` | a card that needs sidecar files (images, a `page.js`, its own children's folders) | The folder side works today: it is an ordinary child page. The move to it exists: `Item.move_to({url, path})` (`core/Item/Item.js:513`) carries the lines across and leaves a forward. |
| **own file** | `/live/foo.jsonl` | a big card with no files of its own | Defined in D9; not routed. |

**Recommendation: one address, two shapes now.** Use embedded by default, and own folder when files are needed.

- **Why not always a folder:** a folder per card means hundreds of folders, each with a `files.jsonl`, and a slower page with one fetch per card. It is simpler code, but the cost lands on every page and every `git status`.
- **Why not all three now:** the own-file shape adds a third loader. Its route `/live/foo` (no trailing slash) also breaks the rule that every page url ends in `/` ([property/url.md](property/url.md)). Because the address never depends on storage, it can be added later without changing a single link.

## 3. Does Ref stitch it back?

Yes; that is what Ref is for. A Ref is a small item that stores where something lives (`url`, `path`), never a copy (`core/Item/Ref.js`, [ref.md](/framework/core/Item/doc/ref.md)).

- It resolves on demand, the first time it is drawn: `Item.open(url)`, one live object per url.
- A folder url opens that folder's `page.jsonl`; a url ending in `.jsonl` opens that file. So it already covers both the folder and the file shapes.
- When an item moves, the old place keeps `{moved_to: {url, path}}`. A Ref that reaches it follows the forward, and quietly saves the new address.

**Caveat:** `RefView` draws a Ref as a link row. On `/live/`, a Ref has to be drawn as the card it points at, so LivePage needs a small "draw a Ref as its target" step.

## 4. Is the breakout-file route built?

**No.** Nothing routes `/live/foo` (no slash) to `/live/foo.jsonl`. The core App still has `App.path_to_page_url` (`core/App/App.js:106`), which maps `/foo` to `foo.page.js`. Only the old sandboxes (`public/alex`, `public/arya`) call it; the framework Router does not. I found no requirement for it in the Page docs. The closest is D9's own-file row above.

## 5. What gets built next

- ✅ **Embedded and openable:** built by mastermind-live-page (2026-11-06).
- ✅ **Breadcrumb** (Live › lab › foo) in LivePage's header, so you can see where you are at any depth (f56543fda).
- ⬜ **Break a card out:** one command, "break out `foo`". It runs `move_to({url: "/live/foo/"})`, so `foo`'s lines go to `/live/foo/page.jsonl` and a Ref takes its place in `/live/`'s content. LivePage then draws the Ref as the card. Estimated $10–15. ⚠ A card id that is a page word (`pages`, `content`) is refused by the list only after its line is written, so break-out must check the id first.
- ⬜ **Own file:** only if folder count becomes a real problem. Same address; the file is just a different store.

## 6. When a card becomes a folder (proposal, 2026-11-06)

**What makes a folder today — every code path, one line each:**

| Path | What it does | `file:line` |
|---|---|---|
| `create_page` tool / `page_set({pages:{add}})` | `Subpages.add()`: `mkdir`, writes `<name>/page.jsonl` line 1, appends a `file` line to the parent | `Servex/agents/Subpages.js:46-58` |
| `Item.move_to({url, path})` | leaves a `{moved_to}` forward on the item; the real file move is the node-side handoff below | `core/Item/Item.js:513-523` |
| `move_item()` (the handoff `move_to` calls into) | carries an item's lines into a new file/folder on disk | `Servex/agents/page_tools.js:771` |
| An agent writing files by hand | `/live/design/` was made this way — no tool, no link line, just files on disk | past-work.md (this task) |
| **Not a folder path:** `LivePage.save()` | keeps a saved screen's cards as data embedded in `/live/page.jsonl` (a `LiveScreen` item in the `screens` List) — never `mkdir`s. Corrects the brief's assumption. | `public/live/LivePage.js:84-92` |

There is **no auto-upgrade today.** Every folder above is made on a deliberate call (a tool, or an agent's hand). A card stays embedded no matter how big it gets or how many nested items it holds — Item nesting (`{"k2":{"answers":{"add":…}}}`) already lets one `page.jsonl` hold a tree, so size and "gaining sub-items" alone don't force a folder; only needing **sidecar files** does (an image, a `page.js`, or a nested item that itself needs a folder two levels down — the `CHILD` regex, `Listing.js:6`, can only name a real `page.jsonl`, so a grandchild-with-its-own-children has nowhere to live inside one file).

**Recommended trigger: promote the instant a card is asked for a sidecar it cannot hold embedded** — a file attached to it, or a `pages.add` aimed at one of its own (embedded) children. Concretely: `apply_pages()` (`Servex/agents/page_tools.js:414`) checks whether `at.target` resolves to an embedded card; if so, it runs `move_to` on that card FIRST (making `<name>/page.jsonl` where `<name>` is the card's own id), leaves a Ref in its place, then adds the new sub-page inside the freshly made folder. ⚠ Today `apply_pages()` refuses any target (`page_tools.js:413`: "`pages` works on the page itself, not inside a target"), so this check needs that restriction relaxed first; the other place for it is a "break out" command that calls `move_to` itself.

**Alternative (named, not recommended): size.** A byte or line-count threshold (e.g. 20 KB or 50 items) on the parent's `page.jsonl`, checked by a periodic sweep. Rejected for now: it fires on a schedule instead of the action that actually needs a folder, so it either promotes too early (a verbose card with no files) or too late (a sweep interval), where the sidecar trigger fires exactly once, at the cause.

**Who performs the move:** the same function already proposed for "Break a card out" above — `Item.move_to({url: "/live/foo/"})` (`core/Item/Item.js:513`), which calls the node-side `move_item` (`Servex/agents/page_tools.js:771`).

**What is left behind:** a `Ref` (`core/Item/Ref.js`) at the embedded slot, `{type:"Ref", path: "<old path>"}` — same mechanism section 3 above already describes; `RefView` still needs the "draw a Ref as its target" step noted there.

**Naming:** the folder name is a slug of the card's title (`My idea` becomes `my-idea/`, made unique among its siblings), not its random id (`nd3r7buc`). So the path segment, the folder name and the title match, and a link's label is the title. At the move, the card takes that slug as its `name`. Slug rules: `Subpages.js:7,108`; title fallback `title ?? name`: `Subpages.js:51`.

This is a proposal: nothing above is built. [Load cost measurements for this task](/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/storage/) back the "why this matters" half of the brief.

## 7. What a parent loads today (measured 2026-11-06)

A page fetches every known child's `page.jsonl`, **2 levels deep** (`Page.class.js:681`, `load_all_children()` at `:685-696`). It reads each whole file and replays every line (`Jsonl.js:28-52`, `Store.js:208-212`).

| url | jsonl files | size |
|---|---:|---:|
| `/live/` | 2 | 3.7 KB |
| `/framework/core/Page/` | 168 | 119 KB |
| `/framework/ai/sessions/2026/11/06/` | 118 | 1.85 MB |
| a made-up tree, 4 levels by 5 children | 31 distinct of 156 (predicted 31); 37 requests, 6 of them repeat fetches of the root | 31 KB |

Every url above loaded to folder level 2 and no deeper. Time to first render was not measured per url; the made-up tree's last request ended at about 1.2 s. The raw numbers are the `log` line of 16:45 in [the task's session.jsonl](/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/storage/); the probe script was not kept.

- **A deep tree is bounded:** below level 2, nothing loads until you open it.
- **A wide folder is not:** 1000 direct children means 1000 fetches on first open (about 16 MB, an estimate: linear from the one sessions-day folder, not measured with a real 1000-file tree). The fix is the preview index, [index-jsonl.md](index-jsonl.md): load each child's title, icon and description from one file, and the full child only when it opens. Not built.
