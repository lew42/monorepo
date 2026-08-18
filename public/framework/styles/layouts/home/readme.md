# Home — a real client homepage, ten bands, one class string each; for anyone asking whether a comp survives the vocabulary

The Figma files this page twice — `23-181` at 1920 and `23-1144` at 375. Here it is **one
`layout()` with no media query**, so the two drawings are the same ten strings at two widths.

## Use

```js /framework/styles/layouts/home/page.js
/* a band bleeds; the words don't — one --measure for the whole page */
const band = (fill, fn) => div.c("pad", () =>
	div.c("measure flex v gap", fn).style({ "--measure": "96em", "--gap": "2.5em" }))
	.ac(fill !== "dark" && fill)
	.style({ "--pad": "clamp(2.5em, 5vw, 5em) clamp(1em, 4vw, 3em)", ...(fill === "dark" ? DARK : {}) });

band("", () => div.c("flex auto gap", () => { copy(); media("4 / 3"); })
	.style({ "--column": "24em", "--gap": "3em" }));      // ← the whole responsive hero

/* the page is `page full flex v` — NOT `fill`. A homepage is a document. §4 */
```

## Watch out

- **No `fill`, and that is the point.** `fill` claims the viewport and scrolls one inner pane — right for an app shell, wrong for a page whose bands exceed a screen. With it, 4549px collapsed into a 284px box at 1440 and seven bands were unreachable. [doc/transition.md](./doc/transition.md) §4
- **`--grow` is now the exact width ratio** (`1.4` → 1.40 at every width) — but it moves the **wrap threshold** too, so express a weight near 1: `4`/`5` for a 0.8 seam stacked at every width. [doc/transition.md](./doc/transition.md) §2
- **`.wash` and `.tint` are keyed to the colour-scheme, not to the band** — on a `dark` band in light mode they paint black on black. There is no background twin of `.muted`. [doc/transition.md](./doc/transition.md) §3
- `--grow`, `--pad`, `--gap` and `--column` all **inherit** — set them on the track that uses them, or a nested `.flex.auto` silently takes the parent's weight.
- The nav is the one inline `flex` on the page, and it is a vocabulary gap: `--grow` only reaches `.flex.auto` children, `.basis` cannot shrink, `.flex-1` never wraps. [doc/transition.md](./doc/transition.md) §1
- Text is the Figma's, verbatim — standing rule 8 allows a rewrite and this is the one page where it would answer a different question. [doc/decisions.md](./doc/decisions.md)

## More

- [Home](/framework/styles/layouts/home/) the two-up · [full size](/framework/styles/layouts/home/full/) a real viewport
- [doc/transition.md](./doc/transition.md) — the claim, the four widths, the three places the two drawings disagree
- [doc/decisions.md](./doc/decisions.md) — tones, the duplicate Services band, what was not built
- Files: `page.js` (the ten strings) · `content.js` (the words, split out so the strings read)
