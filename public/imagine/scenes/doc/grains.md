# The four grains

One mechanism ([`slots.md`](./slots.md)), four sizes of swap. Each is a subtree of
[/imagine/scenes/](/imagine/scenes/), and the only thing that differs between them is the word
in `slot:`. The fifth door uses all four at once — [`observatory.md`](./observatory.md).

## 1. Full scene swap — [`worlds/`](/imagine/scenes/worlds/)

Every land claims `slot: "world"`, so arriving in one deletes the last one whole: floor, fog,
light, weather, the lot. Dawn, Dusk and Deep come out of **one builder and three rows of
numbers** — that is the point of showing three rather than one.

Click the arch. Each land's arch links to the next, so the swap is provable without leaving the
canvas: `/worlds/dusk/` → `/worlds/deep/` and the whole screen changes.

Each land paints the canvas opaque (`sky({ tint })`) because a world with its own weather needs
its own sky. The crossroads and the hub do not, so they stay transparent over the themed CSS
box and follow light/dark for free.

## 2. Single object swap — [`plinth/`](/imagine/scenes/plinth/)

The room is the *parent's* `world`. Torus, Knot and Prism claim `slot: "focus"` and build one
mesh each.

**What proves it:** the ring overhead keeps turning through the swap — its group was never
rebuilt, so its rotation never restarted. And no child declares a `camera`, so the deepest
declaration in the chain is still the room's and the view does not move. Only the thing on the
plinth changes.

The three coloured swatches on the floor are the click targets.

## 3. Region swap — [`quarters/`](/imagine/scenes/quarters/)

One plate, four pads, and each child claims a slot named after its own corner — `grove`,
`dock`, `works`, `court`. Only that corner is ever built or torn down.

**What proves it:** the beacon crossing the middle belongs to the plate's `world` slot, so it
keeps its orbit across every corner change; and the three corners you are *not* in stay flat
pads, because nobody in the chain claims them.

Each corner declares a camera that leans toward it, which is the cheapest way to say *this
one* without moving anything in the world.

## 4. Camera swap — [`gallery/`](/imagine/scenes/gallery/)

Four paintings on a wall, and every one of them is a `<canvas>` drawn with the ordinary 2D API
and hung on a plane — no image files, no fetches. Three are the lands, flattened; the fourth is
the chain itself, and it is the only one painted in the *page's* colours, so it turns over with
light and dark while the others do not.

Click one and **nothing in the room is rebuilt**. The picture's page claims `slot: "spot"`,
which holds one spotlight, and declares a `camera` off the wall — the deepest camera in the
chain wins, so the picture fills the view. That is the smallest a swap gets: the world is
untouched and only where you stand has changed.

**What proves it:** the room's slot map never loses `world=/imagine/scenes/gallery/`, and the
frame counter does not reset. The art is unlit `MeshBasicMaterial` on purpose, so a drawing
reads exactly as drawn in a bright room and a dim one — which also means `stage.link()` skips
it and the hover glow lands on the frame, the way a picture lighting up actually looks.

## All four at once — [`observatory/`](/imagine/scenes/observatory/)

The fifth door is not a fifth grain; it is a place that uses the four. Vela claims `sky` (a
region), The Ring claims `plate` (an object), Eyepiece claims **nothing at all** (a camera, and
the smallest page in the module), Daybreak claims `hour` (a light).

**What proves it:** the telescope. It belongs to the observatory's `world` slot, is never
rebuilt, and *aims itself* — it reads the deepest `look` in the active chain exactly the way
`compose()` reads the deepest `camera`. So does the star field going out at daybreak, and so
does the plate that is missing from the rack while it stands on the easel. "The rest persists"
and "the rest is inert" turn out not to be the same claim. [`observatory.md`](./observatory.md)

## What to look at

| | click this | watch this |
|---|---|---|
| full | the arch | everything |
| object | a floor swatch | the ring — it does not restart |
| region | a pad | the beacon, and the other three pads |
| camera | a painting | nothing but the view — and the caption under it |
| all four | a glass plate on the desk | the telescope: it turns, and nobody rebuilt it |

Measured headless at 1280×900 (2026-08-29) and again at 400 / 1920 / 3440 after the atmosphere
pass: twelve urls, zero console errors; clicked three hops deep and cold-loaded the same url —
url, path bar, slot map, camera target, note and nav row identical; the loop stops dead when
you navigate out of the subtree (frame counter frozen, `running: false`) and restarts on
re-entry. Look: [`ai/2026-08-29/scenes-atmosphere/`](/framework/ai/2026-08-29/scenes-atmosphere/).
