# Page — a folder with a `page.js` or `page.jsonl` is a page: a url, some content, and children.

This module has an expert: ask it with `ask_expert core/Page …` (Servex).

## The sub-systems

[layout](./layout/) — the layout system: navigation and the parent, the page's own room, inside the page
[navigation](./navigation/) — persistent vs switching, the levels that stack, the go-to pattern
[make](./make/) — making a page, five ways; agents use the `create_page` tool (Servex)
[storage](./jsonl/) — `page.jsonl`, a page as a log of lines; who writes it and when: [doc/page-jsonl.md](./doc/page-jsonl.md)
[ai](./ai/) — the page-based AI system: dictation, the fast assistant, a manager per page, sessions and the SDK
[dynamic](./dynamic/) — a url with no `page.js` or `page.jsonl`, loaded by an ancestor's `route()`: data on disk plus one template
[weight](./weight/) — each page's weight: 1 by default, raised by the pages that reference it plus a manual adjustment; heaviest sorts first

This readme is the text version; the rendered page is designed from it ([how](./make/readme-page/)).

## Index

[make](./make/) — five ways to make a page, each with its code and its live result — start here
[layout](./layout/) — the layout system: concepts top down, every kind of layout, how to decide
[generator](./generator/) — builds a whole page tree from a short spec string, so you can try layouts without making files
[jsonl](./jsonl/) — a page described by `page.jsonl` lines instead of a `page.js`, trimmed to the two-line case
[overview](./overview/) — the wall of one picture card per page building block
[old](./old/) — the first Page docs, kept as reference
`tools/links.mjs` — a link-checking script, not a page
[doc](./doc/) — every method, property and topic in full

## Five ways to make a page

All five are on the **[Make a page](./make/)** tab, each with its code and its live result.

1. **`page.js`** — one file. The folder is the url, `children:` is the menu. [overview/page](./overview/page/)
2. **`page.jsonl`** — the same page, as a log; line 1 builds it, later lines call one method each. [jsonl](./jsonl/)
3. **`route(name)`** — a url nobody declared, resolved the moment it's asked for; no `children:` at all. [overview/route](./overview/route/)
4. **Folders, with no `children:` list** — a child built from a name read straight off disk. [overview/folders](./overview/folders/)
5. **A readme as the page** — the content is the module's own `readme.md`. [make/readme-page](./make/readme-page/)

Nothing crawls: a page exists once its parent's `children:` (or a `file` line, or `route()`/`child()`) names it.

## Read next

**Layout** — [layout](./layout/), the layout system: concepts top down, every kind of layout, how to decide, the research worth keeping.

**Navigation** — [navigation](./navigation/) (the pattern: persistent vs switching) · [`doc/navigation.md`](./doc/navigation.md) (children, menus, where links open) · [`doc/labels.md`](./doc/labels.md) (title, label, icon) · [`doc/markdown.md`](./doc/markdown.md) and [`doc/open.md`](./doc/open.md) (`.md` files as pages, and where a click opens)

**Content inside a page** — icon items, sections, outlines: [ux/Content/structure](/framework/ux/Content/structure/)

**Reference** — [`doc/words.md`](./doc/words.md) (the six page words) · [`doc/api.md`](./doc/api.md) (every method and property) · [`doc/jsonl.md`](./doc/jsonl.md) (the log format in full) · [`doc/watch-out.md`](./doc/watch-out.md) (the traps, one line each) · [`doc/more-features.md`](./doc/more-features.md) · [`doc/decisions.md`](./doc/decisions.md), [`doc/findings.md`](./doc/findings.md) (the record) · Files: `Page.class.js` (the class), `Page.css` (every `.page-*` rule), `page.js` (the palette)
