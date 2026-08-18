# Core — the seven classes under every page: four are elements, one owns the url, two are the DOM-free data tier

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
