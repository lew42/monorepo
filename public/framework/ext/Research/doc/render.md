# render — what the page shows, in the order it shows it

One column, top to bottom. **The shape of the dig comes before any sentence does** — a grid of
icon items first, so a reader sees how many sub-areas there are and how each was judged before
reading a single claim. Structure, not paragraphs — the owner's own words (2026-09-28).

1. **Header** — the question, then a meta row (status · minions/minutes · node count). Nothing
   else lives here now; the old minions strip moved to the foot (step 5).
2. **The topic tree** (`tree()`) — one icon item per root, ranked best first and capped at 9.
   Its name is the root's text up to the first `?` or `:`, word-capped either way so a trailing
   `?` on a long sentence can't run the whole thing into the card (`shorten()`). Each item shows
   how many nodes hang off it and its own accepted/rejected/parked tally. A topic with no
   natural sub-areas (LiveReload: its roots ARE the claims) still gets a grid, just of claims.
3. **Verdicts** (`verdicts()`) — the whole-topic tally, then the orchestrator's `summary` lines
   as a short `<ul>` at normal reading size. This used to be the biggest type on the page, one
   1.35em paragraph per line; now it reads like a set of facts, not a shout.
4. **Detail** (`detail()`) — nothing, until a grid item is clicked. A click sets `location.hash`
   to the root's id (a plain `<a href="#id">`; `Router.js` explicitly leaves same-page hash
   links alone, so this needs no framework routing at all). `detail()` reads `location.hash` on
   every draw, opens that one root with the existing card-that-opens-forever tree (`node()`,
   unchanged), and scrolls to it the first time a given id is drawn. A `hashchange` listener
   (registered once, in `content()`) redraws on every click, reload and Back/Forward, so the
   sub-area you were looking at is still open in all three cases.
5. **Minions** (`minions()`) — one muted line, not a strip of chips: `"N running · name: doing"`
   joined with `·`, ellipsised if it overflows. Moved to the foot because "who is digging"
   matters less than what the first four sections already showed.
6. **Process** — a closed `<details>` of the `log` lines, unchanged, at the very foot.

## A card, and why it drills down forever

`icon` big (2.4em) · `text` · kind · **credence tag**, if `why` starts with `credence: X` · state
badge · the counts of what is under it · score as five dots. The **glyph is the scanning
device**: a wall of twenty claims reads as shapes before it reads as sentences, so you can find
the fan one and the socket one without reading either.

Open it and the same shape appears one rung in — the body, then its children, each of them a
card that opens the same way. The body's reasoning (`why()`) is one plain paragraph, *unless*
the node is a `support` or `dissent` whose `why` argues the three judgements separately
(`"true: … logic: … useful: …"`, in any order) — then it reads as three labelled lines instead
of one paragraph nobody can parse (`judgements()`). Neither `credence:` nor the three judgements
are real fields in `verbs.js` — the writers ride them as prefixes inside the existing free-text
`why`, and this side just parses them back out. There is no depth limit because there is no
depth *mechanism*: `node()` calls itself, and the disclosure is a native `<details>`/`<summary>`.

**Nesting is styled by `.research-node .research-node`** — two deep, which is one step at *any*
depth. A per-level `0.9em` compounds, and a drill-down five deep would be unreadable. Deeper
rungs are a left rule, not a card: ten levels cost ten thin lines instead of ten nested boxes.

## The open set

`live()` fires `changed` on every appended batch, and the whole report redraws through
`$view.empty()` — so every element is a new element. Which cards were open is one piece of
state that would be wiped, so it lives on the page as `this.open`, a `Set` of node ids
(`"process"` is in there too, and a root gets added the moment `detail()` opens it, so a card
someone visited stays open on the next redraw even without touching the triangle). `remember()`
sets `.open` from the set and writes back on `toggle`. Without it, a topic that appends every
few seconds would snap shut while you read.

## Sizing

The block claims `.wide` — the cards want the leftover width. Every run of *text* inside it is
capped back to `var(--measure)`, the 40em the page already declares, so the prose keeps its
measure while the cards spread. One column at every width; mobile is the same page, narrower.

## Traps met here

- The site loads Material **Icons**, not Symbols. `mode_fan` (in the first seed file) is a
  Symbols-only name and renders as its literal *word*, many em wide, silently. `glyph()`
  measures once after `document.fonts.ready` — a glyph is about as wide as it is tall — and
  falls back to the kind's own icon.
- `changed` fires outside any captor. Every redraw goes through `empty()`, which re-establishes
  it; nothing builds DOM after the `await` in `content()`.
- `shorten()` cuts at the first `?`/`:` **then** caps by word count either way — cutting at the
  mark alone was not enough, because a long claim's own trailing `?` (not an early one) let the
  whole sentence through as a "short" name (2026-09-28).
