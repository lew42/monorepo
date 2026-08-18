# Sections — a layout with real content in it; fifteen bands that compose into a whole page, for anyone assembling a page from parts

## Use
```js
import { div, p } from "/app.js";
import { band } from "./tone.js";

export default (tone = "dark") =>
    div.c("section-band", () =>
        div.c("measure flex v gap", () => { p.c("h1", "…"); }).style("--measure", "62em")
    ).style(band(tone));
```
A band is `tone => view`, no stylesheet. It becomes a url as an inline child in `page.js`: `{ ...band, name, title, icon, tone, section }`.

## Watch out
- Set `--measure` inline **on the `.measure` div** — the class declares it, so a value on the band around it loses. [doc/decisions.md](./doc/decisions.md) §2
- `flex v gap` inside a band, not `flow` — flow is page rhythm; a hero `h1` once carried 96px of top margin. [doc/decisions.md](./doc/decisions.md) §7
- Nothing here names a colour: the four tones are the theme's own surfaces, and a `dark` band inverts in dark mode by design. [doc/decisions.md](./doc/decisions.md) §3–4
- `section:`, not `render:`, on a child — `render()` is `Page`'s own; a child that overwrote it would blank itself. [doc/decisions.md](./doc/decisions.md) §5
- No helpers: `section()`, `eyebrow()`, `cta()` went with `parts.js` — every band writes the two-div sandwich out, so its source is the lesson. [doc/decisions.md](./doc/decisions.md) §11
- No `toc()` on the index: the bands are real, so the rail read a hero's `h1` as a section of this page.
- Still open: `/sections/#pricing` — a position in the whole-page composition — has no id to aim at. [doc/decisions.md](./doc/decisions.md) §6

## More
- [/framework/styles/sections/](/framework/styles/sections/) — the page: fifteen live bands in the rail, the whole page composed, which layout each band is.
- [doc/decisions.md](./doc/decisions.md) — the full record: what a section is, band vs measure, registry → children, de-flow, the end of `parts.js`.
- Files: `page.js` (children, `whole()`), `tone.js` (`band(tone)`, tone chips), `hero.js` (the canonical band).
