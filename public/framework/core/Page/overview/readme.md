# Page overview demos — fourteen live `Page` trees, one directory each, the rail of `/framework/core/Page/`

## Use
```js /framework/core/Page/overview/<name>/page.js
import { Page, demo, md } from "/app.js";

const hello = () => new Page({ title: "Hello", content(){ md("A page."); } });

export default new Page(demo.tree({ meta: import.meta, group: "Basics", tree: hello }));
```
Add the name to `overview:` in `core/Page/page.js` — the string is the rail order; `group:` is the heading.

## Watch out
- The tree is a **function**, never a `Page` — the card and the stage each need their own copy, and only a function prints as source. [doc/decisions.md](./doc/decisions.md) §Traps
- `children: "a b"` in a demo tree probes the server for files — use object children, `Page`s, or `add()`. [doc/decisions.md](./doc/decisions.md)
- Only the tree function prints: a comment *inside* it is documentation, imports do not show — say in prose where `hero("dark")` comes from. [doc/decisions.md](./doc/decisions.md)
- `hero`, `features`, `pricing`, `footer` return `undefined` — never chain on them, wrap the stack in `div.c("bleed", () => {…})`. [doc/decisions.md](./doc/decisions.md)
- Urls quoted in a demo's prose must sit under its own root (`/guide/…`), or the click leaves the box for the real site. [doc/decisions.md](./doc/decisions.md)
- Never `--measure: none` on a `.page.standard` retune — the whole template silently drops (`ext/demo/app.css`). [doc/decisions.md](./doc/decisions.md)

## More
- [doc/decisions.md](./doc/decisions.md) — why a directory per demo, tree-only source, `group:` headings, the fourteen names, and the eight traps in full.
- Page: [/framework/core/Page/overview/](/framework/core/Page/overview/) · Basics `page children add labels route shapes` · Arrangements `wall catalog dashboard strip deep` · Sites `landing docs site`
- Files: `<name>/page.js` (one tree each), `../page.js` (the `overview:` order), `ext/demo/exhibit.js` (`demo.tree`, the box)
