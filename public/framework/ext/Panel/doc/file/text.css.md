## text.css

The four visual states `text.js` puts on a run of prose, plus the one
document-wide gauge. Outlines only for the passive states — they take no
space, so marking hundreds of text nodes on `mouseover` never reflows the
body underneath them, the same move `ext/layout/layout.css`'s
`.layout-hot`/`.layout-selected` already makes.

```css text.css
.panel-text-hot { outline: 1px dashed var(--line); outline-offset: 2px; cursor: pointer; }
.panel-text-on  { outline: 2px solid var(--prim); outline-offset: 2px; }
```

## Being typed into reads differently from being selected

```css text.css
.panel-text-edit {
	outline: 2px solid var(--prim);
	outline-offset: 2px;
	background: color-mix(in srgb, var(--prim) 8%, transparent);
	cursor: text;
}
```

A solid ring alone already means "selected" (`.panel-text-on`); a session in
progress needs to read as **live**, not just chosen, so `.panel-text-edit`
keeps the same ring colour and adds a tinted background that lifts the box
off the layout behind it.

## The gauge: fixed, one per document, never red

```css text.css
.panel-text-gauge {
	position: fixed; z-index: 41;
	display: none;
	…
	pointer-events: none;
}
.panel-text-gauge.on { display: block; }
.panel-text-gauge.wide, .panel-text-gauge.narrow { background: var(--ink); }
```

`z-index: 41` clears every other overlay in the module — see the full budget
in [doc/overlays.md](../overlays.md) — because the gauge is not scoped to any
one panel; `text.js` appends it to `document.body` once and repositions it
per selection rather than building a new one. `display: none` until `.on`, so
it costs nothing on a page where no run has ever been selected.

⚠ **Amber (`var(--ink)`), never red, for `.wide`/`.narrow`.** A long line is a
judgement, not an error — `text.js`'s own gauge logic already restricts this
to runs that have actually wrapped, and stacking a warning colour on top would
make a deliberate choice look like a mistake to fix.

## `.panel-text-box` — invisible except while you're looking

```css text.css
.panel:hover:not(:has(.panel:hover)) .panel-text-box {
	outline: 1px dashed color-mix(in srgb, var(--prim) 45%, transparent);
	outline-offset: 3px;
}
```

`wrap()` adds a box to hang layout on, not a look — so the wrapper itself is
invisible by default and only shows its bounds while the panel it lives in is
under the pointer, the same innermost-wins idiom every other overlay in this
module uses. A structure you built stays findable without becoming part of
the design.

## Improvements

Nothing ranked: 49 lines, five rules, one idiom borrowed on purpose and one
new. Nothing here is duplicated or doing a job that belongs to `panel.css`.
