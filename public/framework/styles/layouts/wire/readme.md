# Wireframes — eight generic page skeletons, each as one class string; the Figma vocabulary test

Eight layouts from the Figma frame *AI Slop* (`51:1477`). The question was **"can our words
produce these outcomes, on Mega and Mobile"** — seven yes, one no, and the no is the point.

## Use

One spec per layout. `entry` is `400/`'s: a twin card plus a bare `/full/` url to measure.

```js /framework/styles/layouts/wire/specs.js
{
	name: "bands", title: "Header, Three, Footer",
	note: "**`flex auto` is the whole middle.** …",
	layout(){
		return div.c("page full fill flex v", () => {
			region("Header", "…", "wash");
			div.c("flex auto flex-1", () => { /* three */ }).style({ "--column": "20em", ...scrolls });
			region("Footer", "…", "wash");
		}).style(screen);
	},
}
```

## Watch out

- **No word makes a fluid track twice its neighbour.** Two of the eight need an inline `flex: 2 1 30em`; the zero-CSS workaround and its measured decay are in [doc/bento.md](./doc/bento.md)
- **`.tint` is a token, not a class** — typing it paints nothing and throws nothing. Two tones here, `wash` and bare. [doc/decisions.md](./doc/decisions.md)
- **`align-content: start` only where the wrapped lines are UNEVEN** — a rail beside a wall. On peers the default is right, and adding it costs the full-height look. [doc/decisions.md](./doc/decisions.md)
- **`.basis` never grows**, so a wrapped rail keeps its 14em and leaves a gutter at 400. [doc/measured.md](./doc/measured.md)
- Never `.flex-1` for the fluid half of a wrapping row — zero basis, so it shrinks for ever instead of wrapping. [`../doc/decisions.md`](../doc/decisions.md)

## More

- [Overview](/framework/styles/layouts/wire/) · [doc/bento.md](./doc/bento.md) the missing word · [doc/measured.md](./doc/measured.md) 8 × 4 widths · [doc/decisions.md](./doc/decisions.md) the record
- Files: `specs.js` (the eight, and the only two spacing values) · `page.js` (the index)
- Nearby: [400](/framework/styles/layouts/400/) five strings at one width · [shell](/framework/styles/layouts/shell/) the toggleable Holy Grail · [dashboard](/framework/styles/layouts/dashboard/) the same board with real numbers
