# Slots — the whole mechanism

A scene page owns one **slot** of the world and `build()`s it. The world on screen is derived
from the active chain, never accumulated by clicks:

```js
compose(chain){
    const want = new Map();
    chain.forEach(page => is.fn(page.build) && want.set(page.slot, page));   // deeper wins

    for (const name of this.slots.keys()) if (want.get(name) !== this.slots.get(name).page) this.drop(name);
    for (const [name, page] of want)      if (!this.slots.has(name))        this.put(name, page);
}
```

Three consequences, and they are the whole design:

1. **A slot whose page did not change is never rebuilt.** That is what makes "the rest
   persists" *true* rather than merely redrawn — the ring over the plinth keeps its angle
   through an object swap because nothing touched its group.
2. **A cold load and a walk down produce the same world**, because both produce the same
   chain. Verified headless 2026-08-29: url, path bar, slot map, camera target and note all
   identical between clicking three hops down to `/worlds/deep/` and loading it cold.
3. **The grain of the swap is a word**, not a code path. `slot: "world"` replaces everything;
   `slot: "focus"` replaces one mesh; `slot: "grove"` replaces one corner; `slot: "spot"`
   replaces nothing you can see and holds one light.

## Where the seams are

| what | where |
|---|---|
| the canvas, the renderer, the loop | `Scene.Stage`, one per host |
| when to recompose | `Scene.activated()` / `deactivated()` → `recompose()` |
| where the world comes from | `router.active.chain()`, one rAF after the navigation |
| what a click does | `Stage.pick()` → nearest hit with a `userData.url` → `router.go()` |
| what the path bar says | `page.crumbs(host)` — the real crumbs, off `chain()` |

**Both hooks, and the debounce, are load-bearing.** `Router.activate()` only touches what
changed, so going *up* the chain activates nothing — a world refreshed from `activated()`
alone keeps the departed leaf forever (core/Page hit exactly this with its crumb strip). And
`deactivate()` runs *before* `activate()`, so the recompose waits one frame and then reads
`router.active` — which by then is right in both directions, and on a cold load fires once for
the whole chain rather than once per page.

## Opting out of columns

`/imagine/` is a columns host, and a columns host claims its whole subtree: every scene below
would render as another column, and a `full` one would collapse the very column the canvas
lives in. A scene subtree is *one canvas with a tree of states behind it*, so everything below
the host opts out of both halves of the contract — `Scene.column_host()` for the shape,
`Scene.container()` for the mount. The host itself stays a column, because that is how it takes
its place in `/imagine/`.

⚠ The children mount in `$notes`, **not** `$pages`: `Page.render_column()` assigns its own
`$pages` *after* `content()` runs, so a region parked there is silently replaced.

## What a page may declare

- `slot` — the zone it owns. Default `"world"`.
- `build(stage, theme)` — returns an `Object3D`. `theme` is `{ sky, ink, line, prim, dark }`,
  read from resolved CSS.
- `tick(dt, group, stage)` — optional, per frame.
- `camera: { eye, aim }` — the deepest page in the chain that declares one wins, and the
  camera lerps to it. A page that declares none inherits its ancestor's, which is why the view
  does not move during an object swap.
- `content()` — the 2D note, shown under the canvas. One note shows at a time: the arrangement
  contract hides a marked ancestor that has a marked later sibling.
- `sign(stage, theme)` — optional: the miniature the PARENT hangs over the door to me, so a
  portal is drawn by the world behind it. [`atmosphere.md`](./atmosphere.md)

Related: [`grains.md`](./grains.md) · [`atmosphere.md`](./atmosphere.md) ·
[`decisions.md`](./decisions.md) ·
[core/Page columns](/framework/core/Page/doc/columns/) — the 2D system this translates.
