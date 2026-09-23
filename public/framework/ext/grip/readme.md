# grip — a rail's resize edge: a strip just inside the edge it drags, and a pill that rides your pointer. No permanent handle. Shared by [`ext/drawer`](/framework/ext/drawer/), [`dev/DevBar`](/framework/dev/DevBar/), [`core/Sidebar`](/framework/core/Sidebar/) and [`/layouts/shell/`](/layouts/shell/) (`ext/Playground` also used it, deleted 2026-09-06 — see `core/Layout`).

## Use

```js
import grip from "/framework/ext/grip/grip.js";

// inside the rail's own box, which must be positioned
grip({
    write: px => size(px),    // every move: px is the width the pointer implies; return what you applied
    done: w => remember(w),   // optional — once, on release, the width you let go of; skip it if write() already persists on every call
    reset: () => size(null),  // optional — a double-click, with no argument, for "put the width back"
    from: "start",            // omit for a rail docked at the screen's END (drawer, dev rail)
    mirror: from === "start", // the default — override only if your box isn't flush against a rail edge · [doc/decisions.md](./doc/decisions.md)
});
```

## Watch out

- `from` picks the pointer arithmetic (which edge of the PARENT is pinned); `mirror` (defaults to matching `from`) picks which side the strip and its lit line sit on. Every rail wants the default. A grip whose OWN box is repositioned every frame by the caller, not flush against a moving rail edge — `ai/v/3`'s column split — passes `mirror: false` to keep the line under its own local start regardless of `from` · [doc/decisions.md](./doc/decisions.md)
- A start-docked rail is stamped `.grip-start` and `grip.css` mirrors strip, lit line AND pill together; never flip the strip in your own stylesheet, which leaves the line 10px off the boundary · [doc/decisions.md](./doc/decisions.md)
- The pill's `top` is relative to the grip's OWN box, not the viewport — grip.js reads `getBoundingClientRect().top` on every move and subtracts it, or the pill lags by however far the grip sits down the page · [doc/decisions.md](./doc/decisions.md)
- Mount it **inside** the rail's box, never straddling the edge — a strip hanging outside survives the shut rail's slide as an invisible `ew-resize` column down every page, and `setPointerCapture` swallows the whole gesture, not just the click · [doc/decisions.md](./doc/decisions.md)
- `html.grip-sizing` carries `--rail-ease: 0s`; without it the shell's push trails the pointer by 0.18s · [doc/decisions.md](./doc/decisions.md)
- The width is measured from the rail's **own** inline-end edge, not `innerWidth` — a rail parked beside another one would size past the pointer · [doc/decisions.md](./doc/decisions.md)
- `rem`, never `em`: a grab target does not scale with the type beside it · [doc/decisions.md](./doc/decisions.md)
- Hidden below 34em — both rails stop being side rails around there; a rail that stacks at a WIDER breakpoint than that (`core/Sidebar`'s 52em, `/layouts/shell/`'s 44rem) needs its own extra override, since 34em is `grip.css`'s own floor, not every consumer's · [doc/decisions.md](./doc/decisions.md)
- `done` and `reset` are both optional — pass only the ones your rail needs. A `write()` that already saves on every call (`/layouts/shell/page.js`'s `size_rail()`) has no use for `done`. · [doc/decisions.md](./doc/decisions.md)

## More

- [doc/decisions.md](./doc/decisions.md) — why it left `dev/DevBar`, the offscreen record, what `write`/`done`/`reset` are for, and the 2026-09-18 merge with `core/Sidebar` + `/layouts/shell/`'s own copied gesture
- Files: `grip.js` (the pointer choreography), `grip.css` (the strip, the pill, the sizing class)
- [Overview](/framework/ext/grip/) — the page
