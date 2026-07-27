# Page2 loading & the parent-chain problem

Notes on how Page2 pages find their ancestors, why `app.js` preloads the
michael tree, and what does / doesn't work for wiring `.parent` links.

## 1. `app.js` always loads `./michael/page.js`

`app.js` has a static `import michael from "./michael/page.js"`. Since
`index.html` loads `app.js` on **every** URL, that one import cascades:

```
index.html → app.js
  → import michael/page.js
       → import elements/page.js
            → import elements/text/page.js  (+ input, button, …)
       → import layout/page.js → …
```

So the **entire michael tree is constructed at boot, on every page load**,
before any page renders. That's what lets Page2 work: when you hard-reload
`/michael/elements/text/`, the `elements` and `michael` page objects already
exist in memory — Page2 doesn't have to discover them from scratch.

### Tradeoff

- Other top-level pages (`/alex/`, `/arya/`, …) are just **manual `href`s** in
  `app.js`'s nav — they are NOT imported, so they don't get preloaded. Cheap.
- `michael` IS imported, so we can call `michael.link()` (a real Page2 link with
  title/url) AND get the whole tree for routing. Convenient, but…
- …it means **the whole michael subtree downloads/parses on first load of any
  site page**, even the homepage. Fine while the tree is small (~20 tiny
  modules); a real cost if it grows large. Importing everything eagerly = big
  initial payload.
- A **bundler** changes this calculus: the tree becomes one chunk anyway, and
  you'd lean on code-splitting boundaries instead of this eager import.

Rule of thumb: eager-import a subtree only when you need its objects up front
(routing, `.link()`). Otherwise a plain `href` string is lighter.

## 2. Two ways to walk from a page up to its ancestors

Both need the same end result: from a leaf page, produce `[root … leaf]` so the
ColumnPager can show the last two as columns and the rest as breadcrumbs.

### (a) Climb path-by-path (current)

`Page2.chain()` derives the parent URL by string math (`/a/b/` → `/a/`), then
**dynamic-imports** each ancestor's `page.js`, climbing until it hits a non-Page2
(so it stops before the site root `/`). The leaf never imports its parent — the
framework derives it from the URL.

- Pro: only loads the ancestors on the actual path; no upward imports in pages.
- Con: `import(App.path_to_page_url(url))` is a **computed** dynamic import — a
  bundler can't statically follow it. Also async (an `await` per level).

### (b) Skip to the root + adoption (alternative)

Since `app.js` already loads the michael **root**, and the root statically
imports all its children (which import theirs), one import of the root loads the
whole tree. Then, if each parent **adopts** its children in its constructor:

```js
this.children.forEach(child => child.parent = this);
```

every page ends up with a `.parent` backref, and the chain is a plain
synchronous walk:

```js
chain(){ const c=[this]; let p=this; while(p.parent){ p=p.parent; c.unshift(p);} return c; }
```

- Pro: no computed dynamic import (all static) → bundler-friendly; synchronous.
- Con: loads the whole subtree eagerly (see §1 tradeoff).

Imports flow **down** (parent imports children); `.parent` links point **up**
(set by adoption). No page imports its parent, so there's no import cycle.

## 3. Can the child import its parent instead? (tested — mostly no)

The tempting idea: make it mutual — parent imports child (for previews), child
imports parent (for the backref) — and dodge the circular-import trap by putting
the child's import *after* its `export default`:

```js
const page = new Page(...);
export default page;          // export first…
import parent from "../page.js";  // …import last
page.parent = parent;
```

**This does not help. Two ES-module facts kill it:**

1. **`import` is hoisted.** Its textual position is irrelevant — the dependency
   is evaluated before the importing module's body runs. Proven: an `import`
   written on the last line of a module still ran *before* that module's first
   `console.log`.

2. **A circular partner reads an uninitialized binding.** In a cycle, whichever
   module loads first pulls in the other *before finishing its own body*, so the
   other sees an uninitialized export. Tested, both directions:

   | entry (hard-reloaded page) | `page.parent = parent` (eager read) |
   |---|---|
   | child first (`/a/b/`) | ✅ works — parent already finished evaluating |
   | parent first (`/a/`)  | ❌ `ReferenceError: Cannot access 'parent' before initialization` |

   `export default page` before the import doesn't save it: when the parent is
   the entry, the child's body reads `parent` while the parent is still mid-load.

**The only way mutual circular imports work is if EVERY cross-reference is
deferred behind a function** (`parent: () => …`, `children: () => […]`), so the
read happens after all modules finish. That works both directions — but the
*natural* eager form silently breaks only on deep reloads. A footgun.

### Conclusion

Don't do mutual imports. Use **adoption** (§2b): one-way imports (parent →
child), parent sets `child.parent`. No cycle, no hoisting subtleties, no
deferred-read discipline. The child stays ignorant of its parent; the parent,
which already imports the child, simply claims it.

*(Test scripts lived in scratch, not committed. Node 24, native ESM.)*

---

# Bottom-up vs top-down loading (the core decision)

## 4. Terminology: eager/lazy is a different axis from static/dynamic

These get conflated. They're two independent axes:

- **eager vs lazy** = *when* a module loads (immediately at boot, or on demand).
- **static vs dynamic** = *how* it's imported (an `import x from …` declaration,
  or an `import(…)` function call).

How they relate:

| | eager (loads now) | lazy (loads on demand) |
|---|---|---|
| **static** `import x from "./y.js"` | ✅ always | ✗ impossible |
| **dynamic** `import("./y.js")` | possible (call it at top level) | ✅ its whole point |

So **static ⟹ eager**, but eager ≠ static (you can eager-call a dynamic import).
"Eager" in these notes means *loaded up front*, not *statically imported*.

The axis a **bundler** cares about is a third thing — whether the specifier is
knowable at build time:

- `import x from "./y.js"` — literal → analyzable, bundled.
- `import("./y.js")` — **literal** string → analyzable → becomes a lazy **chunk**
  (a code-split point). Bundler-friendly.
- `import(someVariable)` — **computed** → NOT analyzable. This is the one that
  hurts. Our current `Page2.chain()` does exactly this
  (`import(App.path_to_page_url(url))`), which is why it won't bundle cleanly.

## 5. Two loading directions for `/topic/sub/leaf/`

**Bottom-up (roughly what we do):** load the **target** (`leaf`) directly, then
climb UP for ancestors (`Page2.chain()` dynamic-imports `sub`, then `topic`).

**Top-down (the proposed idea):** load the **topic** (`/topic/page.js`, the first
segment) FIRST, then descend to the target.

The outcome hinges on **one variable: how a parent references its children.**

- **static-import-all** children (what michael does today): touching any node
  pulls its entire subtree.
- **lazy refs**: a parent points at a child with something light — a plain
  `href` string, a `() => import("./child/page.js")` (literal, lazy), or a tiny
  `./child/preview.js` — so touching the node does *not* drag in the child.

### Payload, per direction × per ref style

| parent→child refs | Bottom-up (load leaf, climb) | Top-down (load topic, descend) |
|---|---|---|
| **static-import all** | **whole tree** — climbing reaches `topic`, which fans out to everything; plus a *computed* import per level; target renders before its context | **whole tree** — `topic` fans out; but no climb, and ancestors are ready first |
| **lazy refs** | **path only** (`topic`+`sub`+`leaf`); still needs *computed* climb-imports; target-first, ancestors stream in async | **path only**; imports can stay **literal** (each page imports its own children) → bundler-friendly; **ancestors-first** |

Two things fall out of the table:

1. With **static-import-all**, direction barely matters — both load everything.
   Top-down just avoids the computed climb.
2. With **lazy refs**, **top-down wins**: it loads only the path, loads
   **ancestors before descendants** (the natural order to draw breadcrumbs →
   columns), and lets every import stay a literal (bundler-friendly). Bottom-up
   with lazy refs still needs the computed climb and renders the leaf before it
   knows its context.

### Where each excels / backfires

- **First-level pages (`/topic/`)**: identical. Both just load `/topic/page.js`.
  The divergence only appears at depth ≥ 2.
- **Top-down excels** at: ancestors-first rendering, literal/bundler-friendly
  imports, and per-page loading control (below). **Backfires** if the topic
  eagerly imports a huge subtree (then any deep link pulls everything) — solved
  by lazy refs — and it needs a way to resolve the descent (more moving parts
  than one direct import).
- **Bottom-up excels** at: dead-simple deep-linking (one import to the target).
  **Backfires** on anything needing ancestors — it must climb with *computed*
  dynamic imports (bundler-hostile) and the target paints before its layout/context
  is known (async pop-in).

> Note the current code pays **both** costs: `app.js` eager-imports the whole
> michael tree (§1) AND `chain()` does computed climb-imports (§2a, redundant —
> it just hits cache). Picking one direction removes the redundancy.

## 6. Passing control to the page (nested-router descent)

Top-down's real payoff: the descent can be **delegated to each page**. The router
hands the topic the remaining path (`sub/leaf/`); the topic — which already knows
its own children — loads the one that matches and hands *it* the rest. Repeat.

Why this is attractive:

- **Each page decides *how* to load each child**: static import (light, always
  needed), `() => import("./x/page.js")` (heavy, on demand), a plain `href` (never
  auto-load — full navigation), or a `preview.js` stub (cheap card, full page only
  on click). The framework doesn't dictate one policy.
- **Imports stay literal** → bundler splits each page into its own chunk for free.
  No `import(computedString)` anywhere.
- It generalizes the "**topic owns its subtree**" idea: the topic is the entry
  point for loading *and* (see §7) for choosing the layout (its `pager`).

Cost: each page needs to map a URL segment → a child (a small `children` map or a
naming convention), and the router needs the descent loop. More machinery than
"framework computes `path_to_page_url` and imports it" — but that machinery buys
literal imports and per-page control.

## 7. Resulting class shape (Page / Router / Pager) — BUILT

> Implemented. `Page2` is gone, split into `Page` + `Pager`/`ColumnPager` +
> `Router` exactly as below. Adoption + registry + synchronous `chain`/`host`
> are live; the michael docs (and their own /page/ /pager/ /column-pager/
> /router/ sections) run on it. See each class's `readme.md`.

The loading decision pointed at this decomposition, which also removed the
"Page vs Page2" fork:

- **`Page` (keep minimal)** — content + `children` (data) + `link`/`preview`.
  Dormant. **No routing, no layout.** You always write `new Page(...)`.
- **`Router` (one, small — the sane core of the old "Pager")** — owns
  `location ↔ page` resolution + `pushState`/`popstate`, and drives the load
  (App.ensure_topic climbs to the pager-owning topic). It calls `page.activate()`
  (title/meta). Keep it tiny; the old Pager "got complicated" because it also
  owned rendering and page state — don't repeat that.
- **`Pager` / layout (a class — justified: columns + breadcrumbs need structure)**
  — given the chain (`topic … active`) and the topic's children, renders the
  layout. `ColumnPager` today; `Tabs`/`Grid` later. A **topic page declares its
  `pager`** (`new Page({ pager: ColumnPager, children: […] })`); descendants
  inherit it via `host()`.

So: routing lives in the **Router**, not in `Page`; the multi-column behavior is
a **Pager** the topic declares — configuration, not a `Page` subclass. One `Page`
class, one small `Router`, swappable `Pager`s. ("Shell" was an earlier word for
this layout class; it's just the ColumnPager.)
