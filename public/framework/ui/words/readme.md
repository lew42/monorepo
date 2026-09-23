# Config words — `ui-contrast` and `ui-compact`, two classes that re-skin everything under them

A config word is a class you put on a **section**, never on a component: it sets custom
properties, and every template inside is already reading them — so adding a word costs the
twenty components on this site exactly zero lines.

## Use

```js
div.c("ui-compact", () => { /* anything in here reads --pad / --gap / --pad-cell smaller */ });
```

`.ui-contrast` swaps `--ink` / `--subtle` / `--line` / `--wash` / `--tint` for higher-contrast
values, light and dark both. `.ui-compact` scales `--pad` / `--gap` / `--pad-cell` /
`--pad-control` by one `--density` knob (default `0.5`), and shrinks `--flow` (prose rhythm)
with it.

## Watch out

- **A word can replace a token, never scale one.** `calc(var(--radius) * var(--density))` is
  a self-reference and CSS drops the whole declaration — that's why `--radius` (theme-owned)
  isn't reachable here, only tokens nothing else declares.
- **A value the framework never tokenized is a value no word can reach** — this page's own
  comparison found four such gaps; three were tokenized into `framework.css` as a result
  (2026-08-21).
- Not a size ramp — `.ui-compact` deliberately leaves `font-size` alone. That's `zoom`, a
  different word for a different job.

## More

- [Overview](/framework/ui/words/) — the live before/after comparison, the density slider, the gaps it found
- [`ux/`](/framework/ux/) — the tier boundary: what stays a word here, what graduates to a class
- Files: `words.js` (the two words, `@layer theme`), `page.js` (the comparison demo)
