**An index of indexes** — a heading per child, and under it that child's own cards.

**Usage** — `framework/page.js`, the site landing. `previews()` is *my children as
cards*; `walls()` is *my grandchildren, under their parent's name*.

```js
content(){ this.walls(); }
```

**Necessity** — earned by three consumers, which is the house's two-consumer bar plus
one. `styles/layouts/page.js` had already hand-rolled it as a local `ladder()`; the
landing wanted it; and any index whose children have children of their own wants it
next. Before this, `/framework/` painted ten icon cards into a 1080px column and left
**72% of a 3440 viewport empty grey** — it showed nothing and linked to ten places.

**Simplicity** — one method, no options, and it invents nothing. Every rung is
`nav_for()` for the heading and the child's own `previews()` for the cards, so a wall
here and the same wall on the section's own page are the same call, drawn by the same
pages. The two `--gap` values are the only numbers, set inline the way every other
wall on the site tunes itself.

**Depth 1, always.** Never grandchildren-of-grandchildren: at 3440 a 14em wall runs
eleven columns and about thirty cards fit above the fold, so a level costs a screen,
not a click.

**A childless child gets no rung.** A heading over an empty wall is this method quietly
turning back into `previews()` — one method, two shapes — and measured, the three leaf
sections under `/framework/` cost 153px of blank before the first card. Leaves belong
in the nav beside the tree, and in a sentence; they are not sections.

**`bleed`, and the inset is paid back.** The stack takes the widest grid track so the
rungs run the width of the region; `Page.css` hands `--gutter-x` back to
`.page.standard > .page-walls` so the cards do not sit against the sidebar. The nested
`previews()` inside each rung keeps its own `bleed`, which is inert there — it is not
a child of the grid — so nothing pays the inset twice.

⚠ **Grandchildren must already be loaded.** `load_all_children()` awaits each child's
own `loading`, and `Router.load()` awaits that, so by render time the Map is full and
the rungs draw once with real titles. A page that builds a tree by hand after mount
gets empty rungs.

The name was weighed against `tree()` (taken — `demo.tree()`, `ext/demo/exhibit.js`) and
`outline()` (reads as text, not cards). Record: `../../readme.md`.
