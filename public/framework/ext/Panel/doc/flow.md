# The flow — a recorded progression of panel steps

> *"A panel flow is like, a recorded progression of panel steps. So when you're
> testing, and you start, split, split, resize, etc… each step, each action, is a step,
> that you can replay, step through, etc. That way, when you're done, I can see exactly
> what you've created."* — the owner, 2026-08-18

`flow.js` records every mutation a workspace makes, in memory, and replays any of them.
`workspace.js`'s `mount()` starts one per workspace; the **page** mounts the scrubber
strip beside it (`scrubber($ws)`), on `/framework/ext/Panel/` and on
[`/framework/ext/Panel/full/`](/framework/ext/Panel/full/).

## A step is the whole tree, not a diff

```js flow.js
capture(){ return { at: Date.now(), snapshot: JSON.parse(JSON.stringify(this.root)) }; }
```

Panel already serializes losslessly — a snapshot is exactly what the saver writes — so
replay is `Item.hydrate(snapshot)` and one redraw. A diff would need an inverse for
`divide`, `split`, `close`, `absorb`, `sow`, `move` and every `set`, and each inverse is
a thing that can be wrong; a snapshot cannot disagree with itself. Stepping *back* costs
what stepping *forward* costs, which is what makes a scrubber possible at all.

⚠ **`root.toJSON()` on its own is not a snapshot.** It hands back the **live** `data`
object and the **live** child Items (`Item.toJSON()`, `List.toJSON()`) — a step recorded
that way rewrites itself on the next `set()`. `JSON.parse(JSON.stringify(root))` walks
the same `toJSON()` and lands plain.

## It hooks the three events, not the six verbs

```js flow.js
["change", "add", "remove"].forEach(event => this.root.on(event, () => this.touch()));
```

The same three `mount()` already binds for save and redraw. Every mutation path goes
through them — a panel drag goes through *none* of the verbs, and a toolbar chip is a
bare `item.set()` — so hooking events catches what hooking verbs would miss.

## One gesture, one step

A step lands `burst` ms (150) after the **last** event of a burst. One `divide()` fires
three events; a seam drag commits two `set()`s at once; a text run fires per keystroke.
Measured on `/full/`: six gestures — split right, split bottom, `display: flex`, a
16-move seam drag, `sow`, `close` — recorded exactly **6** steps.

A step whose snapshot equals the frame already on screen is dropped: a gesture that
ended where it began is not a step.

## The guard, and what "live" means

`go(n)` raises `replaying` for the whole synchronous swap, and the recorder's `touch()`
returns early while it is up — otherwise every replayed step would record itself. The
proof re-checks this: after stepping back to 1 and forward to 6, the flow still holds 6.

Frame **0** is the start — the panel everything was built from — so `n / N` reads
`0 / 6` at the beginning and `6 / 6` when you are live. Build something while stepped
back and the flow carries on from there: `commit()` drops the frames after the one you
are on, because the future it left is not what you made.

⚠ **A replay is a real mutation of the real document.** The workspace saves what it
shows, so scrubbing back writes that older tree through the saver. Stepping forward
again puts the newest one back — nothing is lost — but a flow is not a preview.

## What it costs

Memory only; nothing reaches disk. The six-step tree above (15 panels) snapshots to
**1,513 bytes**; a 50-panel workspace is around 4KB, so the 200-step cap
(`Flow.prototype.max`) is about 800KB at its worst, and the oldest step is dropped past
it. A flow that never mutates is three listeners and an empty array.

## Finding the flow from outside

`Flow.mounted` holds every live flow, pruned to the roots still connected. A page holds
the workspace it built and needs none of this; a headless driver does:

```js
const flow = Flow.mounted.find(f => f.$root.el.closest(".layout-full"));
```

⚠ An SPA keeps the page you came from mounted, and the Doc page carries a workspace
**plus five demo panels** — each with its own flow. "The last one" is not the one you
are looking at.

## One door, live or replayed — `attach(root, $root, { steps })`

`record(root, $root)` — `workspace.js`'s hook, called by every `panel()`/`workspace()` —
is `attach()` with no options. The demo tab's whole addition (`ext/Panel/demo/`) is the
other case: `attach(root, $ws, { steps })` points an already-mounted workspace's flow at
`steps` (an earlier `flow.save()`'s own shape) instead of what it has recorded, then
jumps straight to the newest one. It reuses `$root.flow` when there already is one rather
than binding a second set of root listeners, and `record: false` follows automatically —
so a demo's guide pane can be scrubbed forever and never adds a step of its own, while
its follow-along pane is an ordinary `panel()` call and records exactly as it always has.
One signature either a call site or a future `Workspace` class can reach for.

## Two things that bit, driving it headlessly

⚠ **`insert.js`'s `+` eats a seam drag.** It is `z-index: 5` over `grip.js`'s `2`: a row
split's bar covers the top 2.2rem of its seam, and a **nested column split's** bar covers
2.2rem of its own left edge — which is the middle of the outer seam. A press there moves
nothing. `ai/2026-08-18/panel-flow/`.

⚠ **A synthetic drag needs a frame between moves.** `grip.js`'s `coalesce()` commits on
`requestAnimationFrame`; sixteen `mouse.move`s with no wait give it none, `dragged` stays
false, and `pointerup` takes the *click* branch — it opens the seam menu instead of
resizing.
