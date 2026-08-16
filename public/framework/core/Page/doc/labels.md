# Titles, labels and icons — where each one lives

Everything a menu needs is declared on **the page it describes**:

```js
export default new Page({
    meta: import.meta,
    title: "Start",         // the h1 on this page
    label: "Start here",    // what every menu calls it
    icon: "flag",           // the glyph beside it
    card: "two",           // and, on a gallery wall, its share of the grid
});
```

`nav_for(name)` is the one method that reads them, so a topic's sidebar, its tab
bar and its preview cards structurally cannot disagree about a child:

```
label  →  title  →  the url segment
```

Weakest last. `icon` and `card` come straight off the child, with no fallback.

## A label belongs to the list; a title belongs to the page

Not two spellings of one thing. `/framework/start/` is titled **"Start"** on its own
page and labelled **"Start here"** in the menu, deliberately — a menu entry and a
page heading are different sentences. If a label were a copy of a title, it would be
a bug rather than a feature.

Five pages declare a `label` today. Everything else is happy with its title, which
is the shape to aim for.

## Verdict: the icon lives on the page — reversed twice, then simplified

**Round 1 — the icon lives on the parent's entry.**

| | duplication | eager load | icon before the page loads |
|---|---|---|---|
| (a) icon on the page, parent repeats it as a fallback | **yes** — two copies, can drift | no | yes |
| (b) icon on the page only | no | **yes**, or icons pop in as you browse | no |
| (c) icon on the parent's entry | no | no | yes |

Chosen: **(c)**. An icon identifies the *entry in a menu*, not the page — so there is
nothing to duplicate *from*, and nothing to load. The decisive objection to (b) was
that an icon appearing only after its page is imported makes a menu read differently
depending on where you arrived from.

**Round 2 — reversed.** The argument is correct about everything except which cost
matters more. In practice (c) produced **every icon on this site declared two to
three times**: once in `/framework/page.js`'s hand-typed sidebar, once in the
section's `nav` map, often once more in a sibling menu. The first time anything
moved, they disagreed. The thing it optimised for — no duplication *from* a page —
was achieved by duplicating *between parents* instead. Same bug, longer commute.

So: **a page declares its own `icon`.** What paid for it was eager loading, measured
at +51ms and 27 extra fetches on `/framework/`.

**Round 3 — the payment became the default.** Eager loading is no longer an opt-in
(`./declaring.md`), so a parent-side map had no discovery or timing job left. It
survived one more round as a per-menu override.

**Round 4 (Aug 2026) — the `nav:` map is gone.** With `label` on the child, the map
had exactly one job left: a parent wanting a different word in its own list. That is
now a spread at the call site, where you can see it happening:

```js
const entry = this.nav_for(name);
{ ...entry, label: "Overview" }    // framework/page.js:92,101
```

**What that bought.** One fewer concept, one fewer place a label can live, and no
lookup order to remember. **What it cost:** a parent can no longer relabel a child it
does not control. Nothing on this site wanted to — the one caller that overrides is
overriding *itself*, listing its own index page inside its own sidebar.

**Rejected: putting presentation in `children` itself** (`children: { core: {…} }`).
It collides with `add(name, pojo)`, which already means *"build an inline Page from
these options"* — so a declared child would silently become an inline page that
never loads its own file. Fewest concepts, worst failure.

**Rejected: `icons: {…}` beside `labels: {…}`.** `labels` was once an ad-hoc property
only `framework/page.js` read, in its own `render()`. What stopped that becoming
three parallel maps was folding it into one — and then deleting the one.

## `card` — a page's claim on the wall it sits in

`card: "two" | "tall" | "big"`, carried through `nav_for()` exactly like `icon`, and
applied by `preview_card()` — which puts the bare word on the card, so `Page.css` reads
it as `.page-preview.two`.

It used to be deliberately **ignored** by `previews()`: those cards were flat 60px link
rows, and forcing a two-row span onto one left a 72px hole beside it every time. That
reversed when `previews()` became the wall (Aug 2026) — a wall wants the span. `tall` is
no longer a row span either; it doubles the thumb's ceiling. `./property/card.md`.

Three declarations. It is the weakest of the four and is named as such there.

## Downstream: an entry is duck-typed

`Sidebar`'s `pages` entries answer `.label ?? .title` and `.url`, which is exactly
what `nav_for()` returns — so a parent hands its nav straight in:

```js
pages: [...this.children.keys()].map(name => this.nav_for(name))
```

A plain `{ title, url, icon }` is still first-class, and is what a sidebar uses when
it lists sections it does not want to import at all.
