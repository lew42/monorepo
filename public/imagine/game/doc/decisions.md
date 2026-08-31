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
something. It calls `this.store().clear()`, not `set({})`: the next move re-creates the key, and
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

## Round 3: a reason to go back (2026-08-31)

The run had one shape and you only ever walked it forwards. Three additions, and each had to
answer "why would anyone return to a room they have finished?".

### The secret: the lens is won at the top and wanted at the bottom

The Bone Kiln's scene has said *"the flue runs up and up — all the way to the Spire, by the
draught"* since round 1. The ground lens is the Keeper's, at the top of the Spire, and it only
exists after the trade. So a `look` verb on the Kiln, gated on the lens, is a secret **whose
only route is back down a realm you already emptied** — which is precisely what the map in the
rail is for, and the first thing on this page that rewards it.

**`look` is a fourth verb and it had to be.** `take` grows the pack, `trade` shrinks it, `walk`
records a room. This one costs nothing, takes nothing, and its whole effect is on the ending —
a sentence the game could not previously say. It says nothing at all until you carry the lens,
so a first pass through the Kiln is byte-identical to what it always was (measured: `"WATER / A
firing chamber gone cold centuries back…"`, no control).

**The rail says it in three words**, the same way the Gallery does: the Kiln's meta line turns
to *something to see* the moment you come back down carrying the lens. Measured after the
trade, the Hollow rail read `[…, "needs the brass lamp", "something to see"]` — the trade still
moves two rows in opposite directions, and now it arms a third.

### The second ending, which is not a harder win

The chain is identical; what differs is whether you understood the place. `sights.has("flue")`
picks between them — nothing is stored for the ending itself, the same way `won()` derives from
the pack. Measured, a full run with the flue read: eyebrow *the long way round*, display *The
gate is shut, and you know why.*, tiles `9/9 · 3/3 · 3 · 1 · lit · read`.

**Two endings, not four.** The finale already reported `the lantern: lit/dark`, which is a
second latent axis — and four endings written by two booleans is three screens nobody will
read and a combinatorial voice problem. The lantern stays a *number*; the flue is the fork.

### The journal: the one thing stored that cannot be computed

Everything else on the page is derived, and `decisions.md` has said since round 2 that nothing
is stored which can be computed. **Order is the exception.** `found` is insertion-ordered, but
it cannot say when you took the lamp or that you gave it away between two rooms — that is gone
the instant it happens. So `log` is an array of finished sentences, written at the moment of
the move, and the column is just that array with numbers down the side.

It is a **column**, because everything here is a column, and a real page so it is cold-loadable
and can be a rail row from the first paint. Measured: a full run wrote 14 lines.

**⚠ "Walked the The Vault, in The Spire."** One of nine rooms carries its own article, so the
phrase has to ask (`/^The /`) rather than assume.

### Ambiance: one rung and one word per realm

`tone:` puts each realm on a rung of the `--wash` → `--tint` → `--surface` ladder, on its rail
*and* on every room under it, so changing realm is a visible step. **Which rung is not a taste
call** — [`vary/tone/`](/imagine/vary/tone/) measured these four schemes and `up`'s verdict is
"each column sits visibly ABOVE the one before it". So the Hollow, under the hill, is the
floor. Measured at 1920, both the realm rail and its rooms:

| | The Hollow | The Verge | The Spire |
|---|---|---|---|
| column body | `#f2f2f2` | `#f8f8f8` | `#ffffff` |

The other three schemes are wrong here **on their own verdicts**: `down` reads as recession and
inverts in dark mode (elevation is lighter on both sides, `lew42.css`), `alt` reads as zebra,
`flip` reads as "you are here". Background only, so no realm can introduce a scrollbar the
others do not have.

`air:` is the same idea in one word — *wind*, *water*, *glass* — and it is deliberately the
quietest thing on the screen. It is on the shut screen too: you can feel where you are standing
without getting in.

### Fixed: the map and the rail disagreed after a trade

Round 2 claims the map and the HUD cannot disagree, and they cannot — but **shut** and
**walked** are independent, and only the trade makes that true. Spending the lamp re-locks a
Cistern already in `found`, and the cell stayed a bright, undimmed link while the rail row
beside it said *needs the brass lamp*. It keeps the link and takes the dimming, which is the
honest reading of both facts. Measured across one press of *trade*:

| cell | before | after |
|---|---|---|
| `cistern` | link | link, dimmed |
| `lantern` | span, dimmed | span |

## Round 4: your own goals, and keyboard travel (2026-08-31)

### The goal list: the same mechanic, not a new one

The ask was "one input, lands in the same list mechanic the game already uses." The journal
(round 3) is exactly that mechanic — an array, saved through `page.store()`, numbered on
screen — so the goal list reuses its row markup (`.imagine-journal`/`.imagine-entry`) rather
than inventing a second one. It stays a **separate array** (`goals`, not `log`), because the
two lists have different voices: the journal is what the run *did* (past tense, written by the
game), a goal is what the player *wants* (present tense, written by the player) — merging them
would have the game's own narration and the player's plans read as one undifferentiated feed.

`add_goal()` mirrors `note()` exactly (trim, guard empty, `save()`, `bump()`) but the game
never calls it — only the new input does, and nothing here is ever checked off. The label
("your goals") only appears once there is a second list to tell apart from the run's own
journal; an empty run shows just the input, because a goal is yours to set before you have
taken a single step.

Persisted the same way `log`/`sights` were added in round 3: a third field on the saved shape,
defaulting to `[]`, so a save written before this pass still loads. `reset()` clears it with
everything else — one eraser, one run.

### Keyboard travel: number the choices that already exist

The game's whole navigation IS a set of links (`.imagine-exit`, on every screen: the arrival,
every room, the journal, the finale) — so the metaphor was already "pick one of these," and
numbering them is the entire control. `imagine.css` draws the digit with a CSS counter
(`counter-increment` on `.imagine-exit`, scoped per `.imagine-exits` box) rather than typing a
number into the markup, so the digit can never drift from the DOM order the listener itself
walks.

**One listener, on the ROOT page, not on each room.** `activated()`/`deactivated()` are
page-local (`doc/method/render.md`) — a listener written on a room would drop the instant you
left it. The root is active for the whole time you are anywhere under `/imagine/game/`
(`activated()` does not re-fire on a sibling-to-sibling move, since the root never leaves the
chain), so one `addEventListener` at the top covers every depth.

**Scoped to `.page.active-page .imagine-exit`, never a bare query.** `deactivate()` does not
remove a page's DOM (`doc/method/deactivate.md`) — every room you have ever left keeps its own
`.imagine-exits` in the tree, hidden by CSS. An unscoped `document.querySelectorAll` would
collect all of them; `.active-page` is the one class that names the room you are actually
standing in.

**The focused-input guard runs before the digit is even read.** The goal input takes digits
too — typing "task 1 and 2" must land in the field, not walk to room one then two. Checked
first: `event.target.tagName === "INPUT"` (also `TEXTAREA`, `isContentEditable`), so a focused
field short-circuits the whole handler regardless of what key was pressed.

Measured, headless: at the Iron Gate, exits read `1 Old Quarry` / `2 Wind Steps`; pressing `1`
navigates to the Quarry. On the journal, typing `task 1 and 2` into the goal input leaves the
url unchanged and the field holds the typed text; blurring the input and pressing `1` then
navigates. Zero console errors at 400 / 1920 / 3440.

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
- **A third and fourth ending** off the lantern (round 3). Two booleans is four screens, and
  the voice problem grows faster than the payoff. The lantern stays a number on the finale.
- **A shortcut up the Kiln's flue** (round 3, and round 2 cut it once already). Making the
  flue *walkable* would be a fourth `needs:`, which teaches nothing; making it *readable* is a
  new verb. The scene was written for a shortcut and earns more as a secret.
- **Timestamps in the journal.** A run is not a session — you can leave a tab open for a week
  — so a clock would say things about the player, not the run. The order is the content.
