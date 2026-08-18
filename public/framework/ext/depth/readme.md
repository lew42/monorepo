# depth — a page becomes a 3D scene; `.depth(n)` layers drift as you scroll and lean with the pointer

## Use
```js
import depth from "/framework/ext/depth/depth.js";

content(){
    depth();                                   // scene + the Depth/Motion sliders
    section.c("card", () => { … }).depth();    // a layer; the tier lives in CSS
}
```
```css
.card { --depth: 2; }   /* prefer this to .depth(n): an inline --depth beats every class rule */
```

## Watch out
- `--depth` and `--depth-shadow` inherit; `.depth-layer` resets both, else a card hands its tier and shadow to every heading inside it. [`doc/decisions.md`](./doc/decisions.md)
- Tilt compounds through `preserve-3d`: keep *deepest tier × tilt* under about `3deg`. [`doc/decisions.md`](./doc/decisions.md)
- `preserve-3d` silently flattens on `overflow`, `opacity < 1`, `filter`, `clip-path`, `mask`, `contain: paint` — so a scene cannot be a `.page.fill`. [`doc/decisions.md`](./doc/decisions.md)
- Growth and drift are one factor, `z/(P − z)`: lowering perspective raises both. Separate them with `--depth-flatten` and a low `--depth-step`, then buy motion back from lean/tilt. [`doc/decisions.md`](./doc/decisions.md)
- `perspective` makes the scene a containing block for `position: fixed` and a stacking context. [`doc/decisions.md`](./doc/decisions.md)
- The Depth slider floors at 0.75: below it a tilted plane intersects its parent and renders sliced. [Overview](/framework/ext/depth/)

## More
- [Overview](/framework/ext/depth/) — the page is the demo: scroll it, drag the two sliders
- [`doc/decisions.md`](./doc/decisions.md) — the two corrections, decisions, traps in full, the tuning-token table, `/resume/` numbers
- `doc/method/depth.md`, `doc/file/*.md` — the overview's API and Files tabs
- Files that matter: `depth.js` (scene, sliders, `.depth()` patch), `depth.css` (tokens, layer transform), `/resume/page.js` (the showcase)
