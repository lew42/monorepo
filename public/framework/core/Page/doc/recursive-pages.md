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
| **embedded** (default) | lines inside the parent's `page.jsonl` | almost every card: text, nested cards | **Built for `/live/` (2026-11-06):** `LivePage.route(name)` finds the card by id (`public/live/LivePage.js:121`). The item tool writes to `/live/foo/` through the nearest ancestor `page.jsonl`. |
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
- ⬜ **Break a card out:** one command, "break out `foo`". It runs `move_to({url: "/live/foo/"})`, so `foo`'s lines go to `/live/foo/page.jsonl` and a Ref takes its place in `/live/`'s content. LivePage then draws the Ref as the card. Estimated $10–15.
- ⬜ **Own file:** only if folder count becomes a real problem. Same address; the file is just a different store.
