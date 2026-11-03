# index.jsonl: a page's index, apart from the page (plan, the owner, 2026-11-01)

**The idea.** Every folder (or page) gets an `index.jsonl` that says what is in it, so other code can list, link, search and mention its pages without loading them. It grows out of `files.jsonl`, which already does half of this. Not built; this records the design and its open questions so the next agent starts from here. Source: the owner's dictation of 2026-11-01 (cloud session `e3fd9043`).

## What exists today

- `files.jsonl` per folder, one line per change (`{"file":"x.js"}`, `{"file":"sub/"}`, `{"file":"x","gone":true}`), written automatically by the dev server's watcher, `Server/plugins/PageFiles.js` (chokidar), and read by `core/Page/Listing.js` (`PageListing`). It is what a static host uses to find `page.jsonl` children (a missing line breaks the page there: [navigation.md](navigation.md)). The owner is fine with the watcher writing it: it scales with the tree and has caused no trouble.
- `Dated` (`core/Item/Dated.js`) keeps a day index of pointer rows for collections filed by date.
- Mentions (`ext/Mention/`): `@` and `#` style references that render as links, each namespace backed by some index.
- Older questions on directory deltas and querying: [indexing-2026-10-08.md](indexing-2026-10-08.md).

## The proposal

1. **`index.jsonl` replaces `files.jsonl`.** The same automatic file and folder lines, plus a line for each page in the folder: its path (the hyphenated name), title, icon and a short description.
2. **A page can live in three places**, and the index says which:
   - embedded in its parent's `page.jsonl` (no file of its own);
   - a peer file, `<name>.jsonl`, next to the parent's `page.jsonl`;
   - its own folder, `<name>/page.jsonl` (with its own `index.jsonl`).
   A line with no file or path means embedded. A remote or attached source is possible later.
3. **Pages vs items.** `page.pages` holds sub-pages: they belong in navigation and show up automatically. Items are background data a page may load and render. The index lists pages; items only if there's a reason.
4. **Big folders:** a long file list stays out of `page.jsonl`; that is what the index is for.

## What the index makes cheap

- **Links and previews without a full load.** A link needs only the icon, title and path.
- **Search one level deep.** Text search over children's titles and descriptions reads their index lines, not the children.
- **Autocomplete and mentions.** The index is the namespace a mention looks things up in.
- **Auto-tagging.** While someone types or dictates (a prompt, a chat message, a post, a page), words that match an indexed path or title are upgraded to real references (paths are the ids), so it's clear what was meant and the reference can be indexed back. Notion doesn't do this automatically; the owner wants it. Two shapes: keep the text and let the mention patterns upgrade it when shown, or store the sentence as parts (text and reference objects). Start with the first.

## Open questions

- **Index-only vs full load.** Can a `Page` instance exist from its index line alone and load its `page.jsonl` on demand? Which actions force the full load (render, preview, edit)? Is it one `Page` with a loaded / not-loaded state, or a lighter `PageIndex` class? A tree where some pages are fully loaded and some aren't needs clear lifecycle methods.
- **When both exist,** loading `page.jsonl` may make the index redundant for that page.
- **Previews in the index** would need the full page and its dependencies; keep them out at first.
- **Must every folder have an index?** Probably not: without one you open the folder to see what's in it.
- **References:** a backlink (the source is remembered, the copy is detached) vs a live extension (new deltas applied on top of the original, like a subclass). JSONL instances make the second harder than class inheritance; decide per use.

## Smallest first step

Have the same watcher that writes `files.jsonl` also write the page lines (title, icon, description from `page.js` / `page.jsonl`) into `index.jsonl`, and teach `PageListing` to read it when present. Nothing else changes until that works.
