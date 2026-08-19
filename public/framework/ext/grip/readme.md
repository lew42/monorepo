# grip — a rail's resize edge: a strip just inside its inline-start edge and a pill that rides your pointer. No permanent handle. Shared by [`ext/drawer`](/framework/ext/drawer/) and [`dev/DevBar`](/framework/dev/DevBar/).

## Use

```js
import grip from "/framework/ext/grip/grip.js";

// inside the rail's own box, which must be positioned
grip({
    write: px => size(px),    // every move: px is the width the pointer implies; return what you applied
    done: w => remember(w),   // once, on release — the width you let go of
});
```

## Watch out

- Mount it **inside** the rail's box, never straddling the edge — a strip hanging outside survives the shut rail's slide as an invisible `ew-resize` column down every page, and `setPointerCapture` swallows the whole gesture, not just the click · [doc/decisions.md](./doc/decisions.md)
- `html.grip-sizing` carries `--rail-ease: 0s`; without it the shell's push trails the pointer by 0.18s · [doc/decisions.md](./doc/decisions.md)
- The width is measured from the rail's **own** inline-end edge, not `innerWidth` — a rail parked beside another one would size past the pointer · [doc/decisions.md](./doc/decisions.md)
- `rem`, never `em`: a grab target does not scale with the type beside it · [doc/decisions.md](./doc/decisions.md)
- Hidden below 34em — both rails stop being side rails around there · [doc/decisions.md](./doc/decisions.md)

## More

- [doc/decisions.md](./doc/decisions.md) — why it left `dev/DevBar`, the offscreen record, what `write`/`done` are for
- Files: `grip.js` (the pointer choreography), `grip.css` (the strip, the pill, the sizing class)
- [Overview](/framework/ext/grip/) — the page
