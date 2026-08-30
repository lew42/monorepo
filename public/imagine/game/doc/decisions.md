# The world — the record

## Round 1: the navigation IS the game (2026-08-29)

No canvas, no loop, no game engine. A realm is a page, a room is a page, an exit is an
`<a href>` to a sibling — so the whole thing is the column row doing what it already does,
and the only thing that makes it a *game* is the words plus one lock chain: the Cistern needs
the lamp, the Vault needs the key the Cistern holds. Nine visitable pages come out of one
`WORLD` array, because they are the same shape repeated; the written screens are files.

`hug` was tried on the realm rails and rejected with numbers: The Verge hugged to 128px and
The Hollow to 183px, because one Hollow row says "needs the brass lamp". A rail whose width
depends on which sibling you opened moves the column beside it by 55px on every change.

## Round 2: the loop closes (2026-08-29, second sitting)

The chain ended in a shrug — you took the sigil and nothing concluded, so the run had no
shape. Four things were added and each had to be **visible in the navigation**, because that
is the thesis this whole section exists to argue.

### The mechanic: a trade, not a shortcut

Three candidates: a locked shortcut that opens permanently (the Bone Kiln's flue already says
"all the way to the Spire, by the draught" — it is written and waiting); a room that changes
after an event; a character who wants an item.

**The trade won because it is the only one that is a different verb.** A shortcut and a
changed room are both "a thing becomes reachable", which is what `needs:` already does three
times — a fourth instance of the same idea teaches nothing. `take()` only ever grows the pack.
`trade()` **shrinks** it, and that is a sentence the game could not previously say.

It also gives the clearest possible demonstration of the thesis, because **one click moves two
rail rows in opposite directions**: the Cistern goes from `walked` to `needs the brass lamp`,
and the Lantern Room from `needs the ground lens` to `unwalked`. Measured, headless, 1920 —
the Hollow rail and the Spire rail before and after one press of *trade*:

| | before | after |
|---|---|---|
| Long Gallery | someone is waiting | walked |
| Cistern | walked | needs the brass lamp |
| Lantern Room | needs the ground lens | unwalked |
| pack | lamp, key | key, lens |

**The `after` guard is fiction doing load-bearing work.** The Keeper will not deal until you
carry the iron key. Without it a player could take the lamp, walk straight up to the Spire,
trade it away, and lose the Cistern — and with it the key, the sigil and any possible ending.
The guard is not a rule bolted on; she wants proof you have been down, and the win chain is
already complete by the time she will talk, so the lamp is genuinely spendable.

**A third chip state came with it.** An item you gave away must not read as one you never
found, or the pack quietly lies — `.imagine-gone` is struck through and dotted where
`.imagine-have` is solid and accented.

**And the denominator went.** Four things exist; the pack holds three, because the lamp buys
the lens. `carrying 3/4` would be a target nobody can reach, so the HUD counts what you have
and the four chips say which — carried, given away, or not yet found.

### The ending: one page, two states

`end/` is a real page, so it is cold-loadable and has a url a rail row can point at from the
first paint. The same page is the shut gate and the finale — one `run.watch()` and one
branch — which is the whole persistence argument in miniature: the state is not "which screen
am I on", it is what the store says, and the url is only where you are standing.

**The numbers are read off the store, never counted a second way.** Measured after a full run:
the tiles said `9/9 · 3/3 · 3 · 1 · lit` and the store held nine `found`, three `carried`, one
`traded` and `spire/lantern` in `found`. Identical, because there is one source.

**Start over is the only eraser**, and the rail's old `reset run` button was cut for it — two
erasers is two devices saying one thing, and the run now has a place where ending it means
something. It calls `store(this).clear()`, not `set({})`: the next move re-creates the key, and
until then the browser holds nothing about this game at all. Measured: keys before
`[lew42:/imagine/team/, lew42:/imagine/game/]`, after `[lew42:/imagine/team/]` — the team's
board two columns away keys on its own url and never notices.

### The map: nine cells that cannot lie

In the rail, not a column, because "always available" is the requirement and a column only
exists once you open it. One grid, not three: the realm titles are full-width cells
(`grid-column: 1 / -1`) between the rows they name, so nine rooms and three labels are one box
and one loop.

**A walked room is an `<a>`; an unwalked one is a `<span>`** — not a disabled link, not a link
that refuses. The map shows the shape of the place without walking it for you, and the rule is
enforced by which element gets built, so it cannot drift. Both the map and the HUD read
`found`, so they cannot disagree; measured at every beat of a full run, `a.imagine-map-cell`
count vs `found.length`: 0/0, 2/2, 5/5, 6/6, 9/9, and 0/0 after *start over*.

**A cell shows the room's `name`, not its `title`.** Nine cells across a 14em rail is ~58px
each; every `name` in `WORLD` is seven characters or fewer, and "Long Gallery" needs 90.

### The arrival, and the composition bar

The Field notes column was a paragraph and three lists. It is now an opening: eyebrow, display
line, one accent rule, one lede — `screens/doc/decisions.md`'s finding applied without change.
A display word must be sized by the **block** it composes into, not by however much area was
left over, so `.imagine-open` is capped (`min(100%, max(26em, 62%))`), centred, and the
container query root. The ramp that buys:

| | 400 | 1280 | 1920 | 3440 |
|---|---|---|---|---|
| block | 328 | 517 | 618 | 696 |
| display type | 36px | 57px | 68px | 77px |

One composition class, used by both written screens — the arrival says *The gate is open.* and
the finale *The gate is shut.*, which is the whole run in two lines of type.

**The room chips went with it.** The arrival used to list all nine rooms per realm; the map in
the rail owns room-level state now, and two devices saying one thing is how a screen stops
meaning anything. The arrival keeps what the map cannot say: the chain, and how much of each
realm is walked.

## Measured (headless, 2026-08-29)

A full run at 1920 — nine rooms walked, the lamp traded for the lens, the sigil taken, the gate
shut — then reloaded, then erased. Zero console errors and no overflow at 400 / 1280 / 1920 /
3440. Reload mid-run: the store byte-identical before and after, the finale still drawn, nine
map links. Shots in `/framework/ai/2026-08-29/game-round-2/`.

## Cut

- **A `reset run` button in the rail.** See above — the finale is the eraser, and the rail's
  room went to the map.
- **`preview()` cards as the map.** The ask's phrase was "previews-as-nav", and a real preview
  card is 15em; nine of them do not fit a 14em rail, and a preview is *a picture, never a live
  instance* — the map has to redraw from the store on every move. The cells are the nav
  instead, which is the substance of the idea at the size the rail actually has.
- **A second map on the arrival column**, big. It would be the same information twice on one
  screen at two sizes, and the rail's is on screen at every width above 32em of row.
- **`fill` for the two written screens.** At 3440 a `large` column caps at 1152px and the row
  ends 1984px short of the viewport, which is real. But `fill` moves the emptiness *inside* the
  column — a 2632px sheet of white paper holding a 40em paragraph is worse than a placed column
  on the app's grey field, and it would make the row jump every time you walked into a room.
  The gutter is core's width word doing what it says; the block inside is what this pass owns.
- **Recording the gate in `found`.** It would make the HUD read `10/9` or need a second
  constant. The win is `carried.has("sigil")` and derives from the pack, so nothing is stored
  that can be computed.
