# Sidebar — a brand over a list of links, over a footer that stays put; the one component `core/` ships, for any page that wants site nav

## Use

```js
new Sidebar({ brand: "LEW42", app: this.app, pages: [
	{ title: "Start", url: "/framework/start/", icon: "flag" },
	{ title: "Core classes", pages: [{ title: "View", url: "/framework/core/View/" }] },
]}).ac("basis").style("--basis", "var(--sidebar)");
```

An entry is anything with `.title` (or `.label`) and `.url` — a POJO or a real `Page`; an entry with its own `pages` is a group. `Page.nav_for(name)` hands a whole child tree in. `app` gives the footer its mode toggle; the last line is placement, which is the caller's business.

## Watch out

- One bad `icon:` on one child page widens the whole sidebar and nothing throws — measure a glyph name against the loaded font first. [`doc/decisions.md`](./doc/decisions.md)
- Size the text, pad the box, never the same element — an `em` token resolves per element. [`doc/comp.md`](./doc/comp.md)
- Pass `header` / `footer` as a function, never a View — a View built early lands in the wrong captor. [`doc/decisions.md`](./doc/decisions.md)
- No `app` → no mode toggle, silently; a `Doc` overview has `this.app === undefined`. [`../App/doc/adoption.md`](../App/doc/adoption.md)
- Anything that renders links late must re-run `mark_links()`; no view compares `window.location`. [`../Router/doc/marking.md`](../Router/doc/marking.md)
- Placement is one line at the call site, always the shared token, no fallback. [`doc/placement.md`](./doc/placement.md)

## More

- [`doc/decisions.md`](./doc/decisions.md) — the record: who uses it, why one component, header-replaces, `›`, the proposals and open items
- [`doc/entries.md`](./doc/entries.md) — what an entry is, where labels and icons come from · [`doc/placement.md`](./doc/placement.md) — why this file has no width
- [`doc/views.md`](./doc/views.md) — the four `$` handles · [`doc/tokens.md`](./doc/tokens.md) — `--sidebar-bg` / `--sidebar-ink` and the derivations
- [`doc/narrow.md`](./doc/narrow.md) — below 52em: sticky bar and burger, CSS decides · [`doc/comp.md`](./doc/comp.md) — porting the July 2026 comp, the two em traps
- `doc/method/<name>.md`, `doc/property/<name>.md`, `doc/file/<name>.md` — one per member and file: usage, necessity, simplicity
- Page: [/framework/core/Sidebar/](/framework/core/Sidebar/) · Files: `Sidebar.js` (the class), `Sidebar.css` (tokens, narrow mode), `page.js` (three demos)
