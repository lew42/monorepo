# Tree and data (decision 8)

A page holds **child pages or items/content, rarely both**. Dragging an item onto a page keeps what it is: a page stays a page, because a page is an Item plus routing. The library follows this: `Item` wraps a `Page` and its variants are the page's own `children`, never a second list. Open with @mastermind-page-templates.

## What `Page` holds now (`core/Page/Page.class.js`)

`Page extends Item` directly, and each part is a helper class it composes:

- `content` — one `PageContent` List: a function, a string or an address is one item in it.
- `pages` — the real child storage (a List); `children` is a Map-shaped view over it (`PageChildren`).
- `settings` / `Prefs` — the page's own preferences; `jsonl` — its `page.jsonl` lines.
- `previews()` / `preview(nav)` — the card a parent draws for it (`Previews`).
- `related`, `columns`, `links`, `listing`, `weight`, `work` — one small class each.
