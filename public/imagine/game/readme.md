# The world — a game whose only mechanic is navigation

Three realms, nine rooms, four things, at [`/imagine/game/`](/imagine/game/). A realm is a
page, a room is a page, an exit is a link to a **sibling** — so walking sideways swaps the
deepest column in place while the rails to its left hold still. Nothing here knows it is a
game except the words.

The run survives via core's [`page.store()`](/framework/core/Page/doc/method/store/) — one
key, `lew42:/imagine/game/`, holding six arrays now that a journal and a goal list have
joined `found`/`carried`/`traded`/`sights`. A cold load three columns deep finds a lit lamp
and an open cistern. The mark by the title (`/imagine/paging/doc/persistence.md`) is always
**green** — a run is kept on purpose, never a demo left dirty — and its Reset is the two-press
control that calls `run.reset()` in place, no page reload.

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

## The five things a round can do

- **Take** — the pack grows. `run.take(item)`.
- **Trade** — the pack *shrinks*. The Keeper in the Long Gallery wants the brass lamp and
  holds a ground lens; one click shuts the Cistern behind you and opens the Lantern Room
  ahead. She will not deal until you carry the iron key, and that guard is the only thing
  between a player and a run that cannot be finished — [`doc/decisions.md`](/imagine/game/doc/decisions.md).
- **Walk** — `activated()` writes `realm/room` into `found`, on a cold load too.
- **Look** — the fourth verb, and the only one that costs nothing and changes how the run
  *ends*. There is one: the Bone Kiln's flue, readable only with the lens won at the top of
  the Spire — so the one way to find it is to go back **down** a realm you already finished.
- **End** — the gate at [`end/`](/imagine/game/end/) is a real page and a rail row from the
  first paint: shut while the sigil is in the Vault, the finale once it is in your pack. It
  is the only place that can erase a run, and it draws **two endings** — which one is
  `sights.has("flue")`, nothing else.

## The journal, and the ambiance

[`journal/`](/imagine/game/journal/) is a column that recounts the run in order. It is the one
thing here that is *stored* rather than derived: the HUD, the map and the finale all count the
same sets, but the order you did things in is gone the moment it happens, so a line is written
at the moment of the move.

Each realm carries **one rung** of the `--wash` → `--tint` → `--surface` ladder (`tone:`) and
**one word** (`air:`). The Hollow is under the hill, so it is the floor; the Spire is the top.
Which rung is not a taste call — it is [`vary/tone/up/`](/imagine/vary/tone/up/)'s measured
verdict, applied.

**Round 4** adds your own goals to the journal (`run.add_goal()` — same store, same row, never
checked off by the game) and keyboard travel — digits 1-9 click the numbered exit, guarded off
any focused input — [`doc/decisions.md`](/imagine/game/doc/decisions.md).

**Round 6** rebuilds Field notes as a 3-column card — left is what to click, centre is the
run's own live state, right is a fill-bar readout per realm — measured against the stacked
list it replaced and kept: same width (a column's width word caps it either way), shorter
(-10% at both 1280 and 3440) — [`doc/decisions.md`](/imagine/game/doc/decisions.md).

## Watch out

- **The map cannot disagree with the HUD** because both read `found`. A walked room is an
  `<a>`; an unwalked one is a `<span>` and cannot be clicked. Do not add a second source.
- **Walked and shut are independent, and only the trade makes that true.** Spending the lamp
  re-locks a Cistern you have already walked. The cell keeps its link (you *have* been there)
  and takes the dimming — it drew as a bright link for two days while the rail beside it said
  "needs the brass lamp". [`doc/decisions.md`](/imagine/game/doc/decisions.md)
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
- **A container query cannot restyle the element that declares the container.** `.imagine-card3`
  is a grid; the query that collapses it to one column at 400 lives on a wrapper
  (`.imagine-card3-frame`) one level up, or it silently never fires — same trap
  `ext/Panel/toolbar` hit in August. [`doc/decisions.md`](/imagine/game/doc/decisions.md)

## More

- [`doc/decisions.md`](/imagine/game/doc/decisions.md) — the record: why a trade and not a
  shortcut, the anti-softlock guard, the composition pass on the two written screens, the
  measurements, what was cut.
- [`/imagine/readme/`](/imagine/readme/) — the place this lives in.
- [`columns.md`](/framework/core/Page/doc/columns/) — the row and the width words.
- Files: `page.js` (all of it — `WORLD` and the four screens), `../imagine.css` (the sheet
  the root, the team and the world share).
