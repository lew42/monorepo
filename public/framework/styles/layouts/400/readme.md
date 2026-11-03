# 400 — five class strings, one column at 400, unstacking on their own past it: the same site five ways, for anyone choosing a page arrangement that survives 3440

## Use
```js specs.js
{
	title: "Wall",
	note: "`grid gap auto` with `--column: 14em` — one card wide at 400, four-plus at 3440. `library/tile-wall`.",
	layout(){
		return div.c("page full fill flex v", () => {
			site.topbar();
			div.c("flex-1 pad", () => site.cards(8, "14em")).style({ minHeight: "0", overflowY: "auto" });
			site.footer();
		});
	},
}
```
`page.js` does `children: specs.map(entry)` — each spec becomes a twin-card page with a bare `/full/` url that `ext/DesignTool` measures. Every card renders `../web.js`'s `site`: no new copy, no CSS here.

## Watch out
- `full(this, () => this.layout())` ships a hidden page — the second `.page` is never Router-marked, so `Page.css` hides it; `entry.js` adds `.ac("default")` — [`doc/decisions.md`](./doc/decisions.md)
- `site.hero()`'s `h1` is sized for the full page — inside a narrow `.measure` it ladders to five lines at 400; render it full width — [`doc/decisions.md`](./doc/decisions.md)
- `pad` stacks — `hero()` sets its own `--pad`; wrap only `sections()` — [`doc/decisions.md`](./doc/decisions.md)
- Column's ~117-character lines at 1920/3440 are the demonstration (`bad/stacked-forever`), not a bug — no `.measure` — [`doc/decisions.md`](./doc/decisions.md)
- Column's one `high` at 1280 is the meter catching a scrollbar gutter, not text — [`doc/decisions.md`](./doc/decisions.md)

## More
- [`doc/decisions.md`](./doc/decisions.md) — the five vs the library, the four-width measurements, traps in full, open items
- Page: [/framework/styles/layouts/400/](/framework/styles/layouts/400/) · meter: [`ext/DesignTool/widths/`](/framework/ext/DesignTool/widths/)
- Files: `specs.js` (the five strings), `entry.js` (spec → twin page), `page.js` (rail and intro)
