# Core — the seven classes under every page: four are elements, one owns the url, two are the DOM-free data tier

## Index

- [App](./App/) — boot and the one container pages mount into; you construct it once in `/app.js`
- [Item](./Item/) — one node of a persistent document tree, no DOM; base for anything that nests and saves
- [Layout](./Layout/) — thirty browsable page arrangements, each proven at seven widths
- [List](./List/) — the ordered collection behind `item.items`; an Item detail
- [Page](./Page/) — a folder with `page.js`: a url, content and children
- [Router](./Router/) — turns a url change into the DOM state; for anyone building pages or links
- [Search](./Search/) — the site's search corpus, ranking and search box
- [Section](./Section/) — a page you put inside a page
- [Sidebar](./Sidebar/) — brand over a tree of links, resizable, for site nav
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
