# Sidebar — a brand over a TREE of links, resizable by its own edge, over a footer that stays put; the one component `core/` ships, for any page that wants site nav

## Use

```js
new Sidebar({ brand: "LEW42", app: this.app, root: this })
	.ac("basis").style("--basis", "var(--sidebar)");
```

`root: <a real Page>` walks `page.children` live, via [`ux/Tree`](/framework/ux/Tree/) —
lazily (a branch fetches its own subtree the first time you open it) and adaptively (folds to
the path you are on, its siblings and its own children, so a five-level site stays a short
list). No `root`? Pass `pages:` instead — the same POJO shape as before (`{title, url}`, or an
entry with its own `pages` for a group) — and it renders through the same tree, just without
the live, lazy depth. A search box (from [`ux/Filter`](/framework/ux/Filter/)) sits above the
tree — type and it narrows to titles that match, keeping every branch that leads to one open;
clear it or press Escape to put the fold state back exactly how you left it. Drag the panel's
own right edge to resize it, 12rem to half the room, with [`ext/grip`](/framework/ext/grip/)
(the same handle `/layouts/shell/`'s own rail uses now); double-click resets. `app` gives the
footer its mode toggle; the last line is placement, which is still the caller's business, not
this file's.

## Watch out

- One bad `icon:` on one child page widens the whole sidebar and nothing throws — measure a glyph name against the loaded font first. [`doc/decisions.md`](./doc/decisions.md)
- Size the text, pad the box, never the same element — an `em` token resolves per element. [`doc/comp.md`](./doc/comp.md)
- Pass `header` / `footer` as a function, never a View — a View built early lands in the wrong captor. [`doc/decisions.md`](./doc/decisions.md)
- No `app` → no mode toggle, silently; a `Doc` overview has `this.app === undefined`. [`../App/doc/adoption.md`](../App/doc/adoption.md)
- Anything that renders links late must re-run `mark_links()`; no view compares `window.location` — `reveal()` already does this once the tree's own rows exist. [`../Router/doc/marking.md`](../Router/doc/marking.md)
- Placement is one line at the call site, always the shared token, no fallback — resizing overrides `--sidebar` LOCALLY, on the panel itself, never the shared one other files read. [`doc/placement.md`](./doc/placement.md)
- The width lives under one localStorage key, `lew42:sidebar` — every `Sidebar` on the site shares it, on purpose (it's persistent chrome, not a per-page setting). [`doc/decisions.md`](./doc/decisions.md)
- Below 52em the panel is a sticky top bar with a burger, and CSS turns the resize handle off — nothing to drag on a phone. [`doc/narrow.md`](./doc/narrow.md)
- A `root:` tree now respects `leaf: true` the same way `pages:` data always did — fixed in `ux/Tree` 2026-09-18, no longer a caveat here. [`../../ux/Tree/doc/decisions.md`](../../ux/Tree/doc/decisions.md)
- The filter only searches rows `ux/Tree` has already loaded — a lazy branch nobody has opened yet is judged by its own title alone, never fetched just to be searched. [`doc/decisions.md`](./doc/decisions.md)
- A row's every length is the ROW's own `em`, never `--pad`/`--gap` — those are page ramps that cap at 2.6em and once stood one of these rows 48.7px tall at 3440. Same rule for the footer strip: a control never rides a ramp. [`doc/decisions.md`](./doc/decisions.md)
- `max-height` caps a box; it never fills one. The rail takes a real `height: 100dvh` so the footer pins to the bottom — and `height: auto` back below 52em, or the open menu is a full-screen sheet. [`doc/decisions.md`](./doc/decisions.md)
- The filter bar declares no colour: `chrome: false` drops `ux/Filter`'s own card and `.darken-2` (framework.css) brings both the ground and the `--field-bg` that makes the field white. Copy that pair, don't re-write it. [`/framework/styles/system/`](/framework/styles/system/)
- The rail has ONE left edge, `1.2em` — the brand mark, the fold arrows, the filter's field and the footer's gear all stand on it. Moving one of them alone is what makes the rail look wrong. [`doc/decisions.md`](./doc/decisions.md)

## More

- [`doc/decisions.md`](./doc/decisions.md) — the record: who uses it, why one component, header-replaces, `›`, the 2026-09-18 tree + resize pass, the same-day filter + shared-`ext/grip` pass, the 2026-09-19 look pass (the row, the square frame, the filter bar, the pinned footer, the avatar), the workspace-note verdict, the proposals and open items
- [The 2026-09-19 rebuild, before and after](/framework/ai/2026-09-19/sidebar-repair/) — the rail at 1280 / 1920 / 3440 and the 400 menu, with the numbers
- [`doc/entries.md`](./doc/entries.md) — what an entry is, where labels and icons come from · [`doc/placement.md`](./doc/placement.md) — why this file has no width
- [`doc/views.md`](./doc/views.md) — the `$` handles · [`doc/tokens.md`](./doc/tokens.md) — `--sidebar-bg` / `--sidebar-ink` and the derivations
- [`doc/narrow.md`](./doc/narrow.md) — below 52em: sticky bar and burger, CSS decides · [`doc/comp.md`](./doc/comp.md) — porting the July 2026 comp, the two em traps
- `doc/method/<name>.md`, `doc/property/<name>.md`, `doc/file/<name>.md` — one per member and file: usage, necessity, simplicity
- Page: [/framework/core/Sidebar/](/framework/core/Sidebar/) · Files: `Sidebar.js` (the class), `Sidebar.css` (tokens, the tree's dressing, resize, narrow mode), `page.js` (four demos)
