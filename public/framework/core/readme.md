# Core — the eight classes under every page (listed under More): four are elements, one owns the url, three are the DOM-free data tier

**New here? Read [doc/overview.md](./doc/overview.md) first:** the whole core API as short pseudo-classes, and one change followed from click to reload. **Where the Item system stands** (built, not built, next steps): [doc/status.md](./doc/status.md).

## Index

- [App](./App/) — boot and the one container pages mount into; you construct it once in `/app.js`
- [Item](./Item/) — one node of a persistent document tree, no DOM; base for anything that nests and saves
- [Layout](./Layout/) — thirty browsable page arrangements, each proven at seven widths
- [List](./List/) — the ordered collection behind `item.items`; an Item detail
- [Property](./Property/) — one live value; `bind(fn)` returns its own unbind (used by Template)
- [Page](./Page/) — a folder with `page.js`: a url, content and children
- [Session](./Session/) — a record in its own dated folder with a `page.jsonl`; `AISession` extends it
- [Router](./Router/) — turns a url change into the DOM state; for anyone building pages or links
- [Search](./Search/) — the site's search corpus, ranking and search box
- [Section](./Section/) — a page you put inside a page
- [Shell](./Shell/) — five optional regions around a CSS grid (header, left, right, footer, main); a Shell's main can hold another Shell
- [Sidebar](./Sidebar/) — brand over a tree of links, resizable, for site nav
- [Task](./Task/) — a DOM-free unit of work: state machine, computed duration and progress, subtasks
- [Test](./Test/) — `class Test` checks and `TestRunner`: find, run on change, record every node test (`X.test.mjs`)
- [View](./View/) — chainable wrapper over one DOM element; every HTML tag is a function
- [new](./new/) — one kept sketch; never import from it
- [doc](./doc/decisions.md) — what belongs in core and the cross-tier traps (no readme; docs only)

## Use
```js
// app.js
import App from "/framework/core/App/App.js";
window.app = new App();
export * from "/framework/core/App/App.js";
// page.js
import { Page, p } from "/app.js";
export default new Page({ meta: import.meta, title: "Hello", children: "about", content(){ p("Hi."); } });
```

## Watch out
- Core never imports `ext/` or `dev/`; what it needs from outside arrives by constructor injection from `app.js` — [doc/decisions.md](./doc/decisions.md)
- Imports flow down; a child importing its parent breaks only on deep reloads — [doc/decisions.md](./doc/decisions.md), worked example `Page/children/page.js`
- `core/new/` ships but is not live; a typo'd import there resolves to a same-named *different* class, and nothing throws — [doc/decisions.md](./doc/decisions.md)
- A POJO default export whose `render` shadows `Page`'s fails silently; write `content()` — [doc/decisions.md](./doc/decisions.md)
- `Page.regions` is read by core and written only by `ext/tabs`; tolerated here, not a pattern — [Page/doc/property/regions.md](./Page/doc/property/regions.md)

## More
- [Overview](/framework/core/) · [`doc/decisions.md`](./doc/decisions.md) — what belongs in core, the cross-tier traps in full, the open `List` question. Each class below has its own readme; read in this order.
- [View](/framework/core/View/) — chainable DOM element
- [Page](/framework/core/Page/) — url, content, children
- [Router](/framework/core/Router/) — url to CSS classes
- [App](/framework/core/App/) — boot, one container
- [Sidebar](/framework/core/Sidebar/) — brand over links
- [Item](/framework/core/Item/) — persistent node, DOM-free
- [List](/framework/core/List/) — ordered items, zero imports
- [Task](/framework/core/Task/) — a unit of work, DOM-free

## Also here (readme audit, 2026-10-13)
- [Events](./Events/) — on/off/emit mixin everything else builds on
- [track](./track/) — opt-in instance tracking: call once, read back live

## Notes from your asks

- Use the existing items first and simplify them before adding new ones. ([your words](/framework/ai/sessions/f155ecbd-2911-4f55-bc4c-c1cf9d7b7026/?tab=coverage#p6258), 2026-10-14)
