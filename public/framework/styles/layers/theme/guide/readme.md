# Writing a theme — a theme is a class that sets tokens, nothing more; `paper` and `terminal` prove it, for anyone giving the site a new look

## Use

```css
@layer theme {
	.theme-paper {
		color-scheme: light dark;
		--prim: light-dark(#9a5b28, #e0a35e);   --ink: light-dark(#2c2622, #ece4d8);
		--surface: light-dark(#fbf7f0, #1d1917);   --radius: 0.5em;   --font: Georgia, serif;
		color: var(--ink); background: var(--surface); font-family: var(--font);
	}
	.theme-paper.light { color-scheme: light; }   .theme-paper.dark { color-scheme: dark; }
}
```
`<div class="app theme-paper dark">` — the class goes on anything: `body` themes the site, a `div` themes one box.

## Watch out

- Stop at the first rung: global token → component token → rule on generic HTML; a rule naming a component class means that component is missing a token — [doc/decisions.md](./doc/decisions.md)
- Light and dark are one file, `light-dark()` per token — split files drift, and a token missing in dark shows at 11pm — [doc/decisions.md](./doc/decisions.md)
- "Later `@layer theme` wins" holds only at equal specificity — a component's `.page > h2` still beats a theme's flat `h2` — [doc/decisions.md](./doc/decisions.md)
- A colour that backs a whole app cannot be translucent — a dark `--wash` over a transparent `body` rendered pale grey — [doc/decisions.md](./doc/decisions.md)
- Name a theme a proper noun (`paper`), an axis an adjective (`dark`, `compact`); `theme-blue-big` is the failure — [doc/decisions.md](./doc/decisions.md)

## More

- [Writing a theme](/framework/styles/layers/theme/guide/) — both themes side by side, both modes, the ladder; next: [lew42](/framework/styles/layers/theme/lew42/)
- [doc/decisions.md](./doc/decisions.md) — who owns component looks (tokens), the four-rung ladder, `:where()` tried and reverted, `light-dark()`, naming, the dark-mode record
- Files: `paper.css` (tokens only, both modes), `terminal.css` (dark-only, one rung-3 rule), `page.js` (demos, Doc index); `doc/file/*.md` — per-file notes the `Doc` page renders
