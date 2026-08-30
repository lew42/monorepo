# The world — a game whose only mechanic is navigation

Three realms, nine rooms, four things, at [`/imagine/game/`](/imagine/game/). A realm is a
page, a room is a page, an exit is a link to a **sibling** — so walking sideways swaps the
deepest column in place while the rails to its left hold still. Nothing here knows it is a
game except the words.

The run survives, because it is stored against the page's own address:
`localStorage["lew42:/imagine/game/"]` holds three arrays — `found`, `carried`, `traded`
([`store.js`](/imagine/readme/)). A cold load three columns deep finds a lit lamp and an
open cistern.

## Use

```js /imagine/game/page.js
const WORLD = [{ name: "hollow", title: "The Hollow", rooms: [
    { name: "cistern", title: "Cistern", item: "key", needs: "lamp", shut: "Pitch dark…" },
] }];
```

`item` is a thing to take, `needs` is what the room is shut without, `shut` is what it says
when it is. `trade: { wants, gives, after }` is the fourth verb. Nine pages come out of that
array; the four written screens (Field notes, and each realm's first room) are pages you would
edit by hand, so they are written out.

## The four things a round can do

- **Take** — the pack grows. `run.take(item)`.
- **Trade** — the pack *shrinks*. The Keeper in the Long Gallery wants the brass lamp and
  holds a ground lens; one click shuts the Cistern behind you and opens the Lantern Room
  ahead. She will not deal until you carry the iron key, and that guard is the only thing
  between a player and a run that cannot be finished — [`doc/decisions.md`](/imagine/game/doc/decisions.md).
- **Walk** — `activated()` writes `realm/room` into `found`, on a cold load too.
- **End** — the gate at [`end/`](/imagine/game/end/) is a real page and a rail row from the
  first paint: shut while the sigil is in the Vault, the finale once it is in your pack. It
  is the only place that can erase a run.

## Watch out

- **The map cannot disagree with the HUD** because both read `found`. A walked room is an
  `<a>`; an unwalked one is a `<span>` and cannot be clicked. Do not add a second source.
- **A cell shows the room's `name`, not its `title`** — nine cells across a 14em rail is 58px
  each, and "Long Gallery" needs 90.
- **`carrying` has no denominator.** Four things exist and the pack holds three: the lamp
  buys the lens. `3/4` would be a target nobody can reach.
- **`hug` is wrong for a nav rail** — measured 128px vs 183px depending on the sibling open,
  which moves the column beside it. Both rails are `small`.
- **Every control is `.imagine-seg .imagine-seg-btn`**, group included around a single button:
  the site theme styles every `button` at (0,2,0) in the same layer.
- **At 400 the row snaps to the deepest column**, so the rail — and the map in it — is one
  swipe left. The crumb strip is the way back.

## More

- [`doc/decisions.md`](/imagine/game/doc/decisions.md) — the record: why a trade and not a
  shortcut, the anti-softlock guard, the composition pass on the two written screens, the
  measurements, what was cut.
- [`/imagine/readme/`](/imagine/readme/) — the place this lives in, and the `page.store()`
  proposal `store.js` prototypes.
- [`columns.md`](/framework/core/Page/doc/columns/) — the row and the width words.
- Files: `page.js` (all of it — `WORLD` and the four screens), `../imagine.css` (the sheet
  the root, the team and the world share).
