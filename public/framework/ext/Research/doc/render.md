# render — what the page shows, in the order it shows it

One column, top to bottom. Nothing else: no tabs, no sidebar, no second copy of anything.

1. **Header** — the question, then a meta row (status · minions/minutes · node count), then
   the **minions strip**: one chip per `agent`, its `doing` live inside it, dimmed and carrying
   `done` once it lands. `"3 running"` leads the strip, because "how many minions are working"
   is the thing you look up for.
2. **Conclusions** — the `summary` lines, at 1.35em, the biggest type on the page. Nothing
   yet: one quiet `digging…`. This is the report; everything below it is the evidence.
3. **Ranked claims** — root nodes, best score first, each a card.
4. **Process** — a closed `<details>` of the `log` lines, at the foot. The receipt, not the answer.

## A card, and why it drills down forever

`icon` big (2.4em) · `text` · kind · state badge · the counts of what is under it · score as five
dots. The **glyph is the scanning device**: a wall of twenty claims reads as shapes before it
reads as sentences, so you can find the fan one and the socket one without reading either.

Open it and the same shape appears one rung in — `why`, `refs`, `img`, then its children, each
of them a card that opens the same way. There is no depth limit because there is no depth
*mechanism*: `node()` calls itself, and the disclosure is a native `<details>`/`<summary>`.
Native buys the keyboard, find-in-page inside a closed card, and printing, for no code.

**Nesting is styled by `.research-node .research-node`** — two deep, which is one step at *any*
depth. A per-level `0.9em` compounds, and a drill-down five deep would be unreadable. Deeper
rungs are a left rule, not a card: ten levels cost ten thin lines instead of ten nested boxes.

## The open set

`live()` fires `changed` on every appended batch, and the whole report redraws through
`$view.empty()` — so every element is a new element. Which cards were open is the one piece of
state that would be wiped, so it lives on the page as `this.open`, a `Set` of node ids
(`"process"` is in there too). `remember()` sets `.open` from the set and writes back on
`toggle`. Without it, a topic that appends every few seconds would snap shut while you read.

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
