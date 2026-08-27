# Doc — a module documented as a page (Overview · API · Docs · Files), each member a real url backed by a `.md` beside it; for anyone writing a module's `page.js`

## Use
```js
export default new Doc({
    meta: import.meta,
    title: "View",
    subject: View,                     // a class, a function, a namespace — or omit it
    methods:    "append ac on style",  // API tab      + doc/method/<name>.md
    properties: "el capture",          // API tab      + doc/property/<name>.md
    notes:      "capturing decisions", // Docs tab     = doc/<name>.md
    files:      "View.js View.css",    // Files tab    + doc/file/<path>.md
    overview:   "demos",               // Overview's rail — overview/<name>/page.js
    children:   "guide",               // a top tab of its own — guide/page.js
    content(){ /* the overview */ },
});
```
Empty section, no tab. Nothing at the call site says "tab" — a different shape overrides `sections()`.

## Watch out
- A Doc nested inside another Doc's tab panel draws its own strip as a left rail (`.tabs.vertical`), never a second well — automatic, no flag: [doc/decisions.md](./doc/decisions.md)
- `files:` goes stale silently — a file not listed is simply absent from the tab: [doc/files.md](./doc/files.md)
- Every tab draws two `h1`s (the well's and the routed page's) — DesignTool flags every Doc; still open: [doc/decisions.md](./doc/decisions.md)
- `content()` is bound to the Doc, not the Overview section — `this.parent` is the module's parent: [doc/decisions.md](./doc/decisions.md)
- No class fields in `Doc.js`; a name dropped from `bar()` also loses its mount region and renders over the page: [doc/decisions.md](./doc/decisions.md)
- `subject.prototype[name]` executes a getter; `/app.js`'s default export is an instance, so member pages come up empty: [doc/decisions.md](./doc/decisions.md)

## More
- [Overview](/framework/ext/Doc/) · [`doc/decisions.md`](./doc/decisions.md) the record — verdicts, traps, open items · [`doc/rail.md`](./doc/rail.md) why the Overview is a catalog · [`doc/reflection.md`](./doc/reflection.md) why the lists are hand-typed · [`doc/files.md`](./doc/files.md) why files are declared
- `doc/method/`, `doc/property/`, `doc/file/` — one prose file per listed member or file, served at `/api/<name>/`, `/doc/<name>/`, `/files/`
- Files that matter: `Doc.js` (the class, every seam), `Doc.css` (well, panel height), `page.js` (Doc documenting Doc)
