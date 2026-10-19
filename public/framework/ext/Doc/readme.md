# Doc — a module documented as a page (Overview · API · Docs · Files), each member a real url backed by a `.md` beside it; for anyone writing a module's `page.js`

## Index

[overview](./overview/) — the urls the Overview tab uses

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
- A class's API tab opens on a **ClassCard**: title card, Core API (the Doc's `core: "name:weight …"`), own members, then inherited groups read off the prototype chain: [doc/class-card.md](./doc/class-card.md)
- A note name may nest (`"guide/setup"`) — each interior segment becomes its own real, bookmarkable page, and the Docs tab draws a folder tree instead of its usual vertical tab bar the moment any note does: [doc/tree/nesting.md](./doc/tree/nesting.md)
- `.../docs/...` resolves to `.../doc/...` automatically and fixes the address bar, so a typed-out-of-habit "docs" doesn't 404: [doc/tree/redirect/docs.md](./doc/tree/redirect/docs.md)
- A Doc nested inside another Doc's tab panel draws its own strip as a left rail (`.tabs.vertical`), never a second well — automatic, no flag: [doc/decisions.md](./doc/decisions.md)
- `files:` goes stale silently — a file not listed is simply absent from the tab: [doc/files.md](./doc/files.md)
- Every tab draws two `h1`s (the well's and the routed page's) — DesignTool flags every Doc; still open: [doc/decisions.md](./doc/decisions.md)
- `content()` is bound to the Doc, not the Overview section — `this.parent` is the module's parent: [doc/decisions.md](./doc/decisions.md)
- No class fields in `Doc.js`; a name dropped from `bar()` also loses its mount region and renders over the page: [doc/decisions.md](./doc/decisions.md)
- `subject.prototype[name]` executes a getter; `/app.js`'s default export is an instance, so member pages come up empty: [doc/decisions.md](./doc/decisions.md)
- A member page has two addresses — `/api/<name>/` (the tab) and `/doc/method|property/<name>/` (where the `.md` sits) — cold-loading either used to only work for the first, since nothing ever registered the second: [doc/decisions.md](./doc/decisions.md)
- A method or property page shows a small **⋯** right after its own title, but only when a design collaboration actually named it — `decisions.js`'s `decision_menu(module, name)` checks the shared `public/framework/ai/collab/decisions.jsonl` (one cached fetch per page load, nothing at all when it finds no record) and, opened, fetches that ONE run's own `collab.jsonl` for the ask, the winner and its vote count. `module()` reads the module path straight off `this.url`, so nothing at the call site has to name it. Contract: `/framework/ai/sessions/2026/09/28/2c074cef-dccf-4e86-8f2b-fb4cf072e115/collab-rounds/collab-format.md`.
- The title band (**the well**) pads by `--gutter-x` and paints a shadow, so it stays `.doc-well` and is not a `.pad.wash` region (a swap moves the title 36px and splits the band in two colours): [doc/well.md](./doc/well.md)
- Below 600px the tab row scrolls sideways on one line instead of wrapping to a second row (Doc.css's own `@media` block, bottom of the file) — shrinks the title+tabs band by about 30% on a phone. **To-do:** the owner also asked for the title itself to become a switcher there ("Dictate · Overview ▾", tap to jump to another tab or the parent page) — not built yet, parked for budget: `/framework/ai/sessions/2026/10/05/mobile-doc-header/mobile-doc-header/`.

## More
- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [`doc/Doc-notes.md`](./doc/Doc-notes.md) — implementation details, design decisions, key patterns
- [Overview](/framework/ext/Doc/) · [`doc/decisions.md`](./doc/decisions.md) the record — verdicts, traps, open items · [`doc/rail.md`](./doc/rail.md) why the Overview is a catalog · [`doc/reflection.md`](./doc/reflection.md) why the lists are hand-typed · [`doc/files.md`](./doc/files.md) why files are declared · [`doc/tree/redirect/history.md`](./doc/tree/redirect/history.md) why the address-bar fix uses `replaceState`, not `pushState`
- `doc/method/`, `doc/property/`, `doc/file/` — one prose file per listed member or file. The page is at `/api/<name>/` (the tab) and, since this fix, also cold-loads at `/doc/method/<name>/` or `/doc/property/<name>/` — the same address the `.md` file itself sits at. A note (`doc/<name>.md`) has just the one address, `/doc/<name>/`. A file's is `/files/`.
- Files that matter: `Doc.js` (the class, every seam), `Doc.css` (well, panel height), `page.js` (Doc documenting Doc), `decisions.js` (the ⋯ menu, above)

- **Tasks tab:** every Doc page lists its module's `tasks/task.jsonl` (ranked by `Task.rank`), built when the tab opens; `no_tasks: true` opts out.
