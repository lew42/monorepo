# Smaller features — children from data, md/, links, related

Moved here verbatim from the readme.

**Children can come from data instead of a string.** Write `children` as a **function** and
core calls it once, on the first ask, and waits for what it returns — so a page whose
children live in a `page.json`, a store or another page's subtree needs no code of its own:

```js
children(){ return fetch("/my/tree.json").then(r => r.json()).then(tree => tree.pages); }
```

Answer with anything `children:` already takes — a string of names, an array, a POJO, real
`Page` objects, or a promise of any of them. [`doc/data-children.md`](./doc/data-children.md)

**Every page has an `md/`.** `/framework/ext/Panel/md/` lists the module's markdown files and `md/doc/decisions/` renders `doc/decisions.md`; a link to any `.md` opens its rendered page. Try [/framework/ext/Panel/md/](/framework/ext/Panel/md/): [`doc/markdown.md`](./doc/markdown.md)

**A link carries no target; the page that holds it decides where it opens.** `open_link(link)` navigates by default, opens a doc as the next column in a columns tree, and a card says `open_link(link){ return this.swap_link(link); }` to swap it in place. The same link three ways: [/framework/ext/markdown/open/](/framework/ext/markdown/open/) · [`doc/open.md`](./doc/open.md)

The file is the route: `./x/` renders `./x.md` as markdown when no `page.js` claims `x` — write a `.md` beside a page, link to it, and it is a page. Nothing crawls; the **link** is the naming.

**A page can be a log file instead of code.** Put a `page.jsonl` in a folder where you would put a `page.js`. Its first line builds the page; each later line calls one method on it, so `{"place": "note.md"}` calls `place()` and draws `note.md`. The dev server adds a line for every file it sees, but a file shows on the page only once a `place` line puts it there. See it running at [/framework/core/Page/jsonl/](/framework/core/Page/jsonl/); the rules are in [`doc/jsonl.md`](./doc/jsonl.md).

**A right aside of related links is one more line.** `related: "/a/ /b/"` draws a small "Related" list beside the page — each row's icon and title read live off the target, so a renamed target updates itself: [`doc/property/related.md`](./doc/property/related.md)
