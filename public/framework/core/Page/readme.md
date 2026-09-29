# Page — a folder with a `page.js` or `page.jsonl` is a page: a url, some content, and children.

## Index
[make](./make/) — the four ways to make a page, each with its code and its live result — start here
[layout](./layout/) — choosing a layout: standard, split, columns, floating page, top-down shape
[generator](./generator/) — builds a whole page tree from a short spec string, so you can try layouts without making files
[jsonl](./jsonl/) — a page described by `page.jsonl` lines instead of a `page.js`, trimmed to the two-line case
[overview](./overview/) — the wall of one picture card per page building block
[old](./old/) — the first Page docs, kept as reference while the Overview replaces them
[tools](./tools/) — a small link-checking script (`links.mjs`), not a page (no readme yet)


## Use — four ways to make a page

All four are on the **[Make a page](./make/)** tab, each with its code and its live result. Smallest first:

**1. `page.js`** — one file. The folder is the url, `children:` is the menu, in order:
```js
import { Page, md } from "/app.js";

export default new Page({
    meta: import.meta,
    title: "Docs",
    children: "intro guide api",
    content(){ md("Hello."); this.previews(); },
});
```

**2. `page.jsonl`** — the same page, as a log. Line 1 builds it; every later line calls one method:
```
{"title": "Notes"}
{"place": "note.md"}
```
[jsonl](./jsonl/) — the two-line case above, live. [jsonl/full](./jsonl/full/) — every line the format knows.

**3. `route(name)`** — a url nobody declared, resolved the moment it's asked for. No `children:` at all:
```js
route(name){
    return ["html", "css", "js"].includes(name) && { title: name.toUpperCase(), content(){ … } };
}
```
[overview/route](./overview/route/) — the textbook case, live.

**4. Folders, with no `children:` list** — `route()`'s biggest job: a page whose child is a name read straight off disk, the pattern behind `ai2/`'s day and card pages:
```js
async child(name, levels){
    return this.add(name, { title: name, content(){ … } }).load_all_children(levels);
}
```
[overview/folders](./overview/folders/) — the smallest real version, live.

Nothing crawls: a page exists once its parent's `children:` (or a `file` line, or `route()`/`child()`) names it. A `.md` beside a page is a page too, once something links to it.

**Route everything.** Anything a reader can see should have its own url, so reload and Back land where they were. A doc swapped in place (`swap_link`) already does: it pushes `<page>/md/<doc>/`. [doc/open.md](./doc/open.md)

**Content inside a page** has its own vocabulary — icon items, sections, outlines — so a page's insides look as structured as its navigation does: [ux/Content/structure](/framework/ux/Content/structure/).

## Read next

**Layout** — [Layout tab](./layout/) starts with *Choosing a layout*: standard, split, columns, floating page and top-down shape, one line and one link each. [`doc/layout-overview.md`](./doc/layout-overview.md) and [`doc/columns.md`](./doc/columns.md) go deeper.

**Navigation** — [`doc/navigation.md`](./doc/navigation.md) (children, menus, where links open) · [`doc/labels.md`](./doc/labels.md) (title, label, icon) · [`doc/markdown.md`](./doc/markdown.md) and [`doc/open.md`](./doc/open.md) (`.md` files as pages, and where a click opens)

**Reference** — [`doc/words.md`](./doc/words.md) (the six page words) · [`doc/api.md`](./doc/api.md) (every method and property) · [`doc/jsonl.md`](./doc/jsonl.md) (the log format in full) · [`doc/watch-out.md`](./doc/watch-out.md) (the traps, one line each) · [`doc/more-features.md`](./doc/more-features.md) · [`doc/decisions.md`](./doc/decisions.md), [`doc/findings.md`](./doc/findings.md) (the record) · Files: `Page.class.js` (the class), `Page.css` (every `.page-*` rule), `page.js` (the palette)
