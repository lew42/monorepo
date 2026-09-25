# Page — a folder with a `page.js` or `page.jsonl` is a page: a url, some content, and children.

## Use
A `page.js` is one file. The folder is the route, and `children:` names the folders beneath it, in menu order:

```js
import { Page, md } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Docs",
    children: "intro guide api",
    content(){ md("Hello."); this.previews(); },
});
```

A `page.jsonl` is the same thing as a log. Line 1 builds the page; every later line calls one method on it:

```
{"title": "Notes", "icon": "description"}
{"place": "note.md"}
```

Nothing crawls: a page exists once its parent's `children:` (or a `file` line) names it. A `.md` beside a page is a page too, once something links to it.

## Read next
- [`doc/navigation.md`](./doc/navigation.md) — children, menus, where links open
- [`doc/layout-overview.md`](./doc/layout-overview.md) — the page grid, columns, containers, padding
- [`doc/columns.md`](./doc/columns.md) — `columns()` in full
- [`doc/jsonl.md`](./doc/jsonl.md) — pages that are log files
- [`doc/markdown.md`](./doc/markdown.md) and [`doc/open.md`](./doc/open.md) — `.md` files as pages, and where a click opens
- [`doc/words.md`](./doc/words.md) — the six page words (`width`, `content`, `surface`, …)
- [`doc/api.md`](./doc/api.md) — every method and property
- [`doc/watch-out.md`](./doc/watch-out.md) — the traps, one line each
- [`doc/more-features.md`](./doc/more-features.md) — children from data, `related:`, `md/`
- [`doc/decisions.md`](./doc/decisions.md), [`doc/findings.md`](./doc/findings.md) — the record
- Files: `Page.class.js` (the class), `Page.css` (every `.page-*` rule), `page.js` (the palette)
