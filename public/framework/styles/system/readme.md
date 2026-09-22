# System — the one page that says what the design system is, painted at your window's width

## Use
Need a space? Type the class, never the number.

```js
div.c("flex gap", …)        // gap: var(--gap)
view.ac("pad")              // padding: var(--pad)
div.c("flex gap-35", …)     // a tighter row — one rung down
```

Seven lengths, and that is the whole vocabulary: `--flow` (between sections) · `--pad` (a
box's own padding) · `--gap` (between things in a row) · and four rungs under the gap,
`--gap-70` `--gap-50` `--gap-35` `--gap-25`. The number in a rung's name is a **percent of
`--gap`**, never a length.

## Watch out
- **A framed box does not take `.pad` — it takes `.card`.** `.pad` is a page REGION's word (it scales with the page, and sits pinned at a 1em floor inside anything narrower than ~1292px — wrong for a card, which is nearly always that narrow). `.card` carries its own `--pad-card` token instead, so it scales with itself. The rule and the live numbers, side by side: the page's own "Region, card, control" section, painted at your window's width right now.
- A spacing value is a token or a rung — never a multiplier, never a raw number. `calc(var(--gap) * 0.4)` is the habit this page exists to replace; the site had 28 different multipliers when the rungs were fitted. [`doc/census.md`](./doc/census.md)
- A control's own padding is `em`. A chip, a button, a nav item, an input: its padding, its height and the gap between its own icon and its own label never ride a spacing clamp — the clamp caps at 2.6em and stands a nav item 67px tall at 3440. [/framework/styles/system/studies/size/](/framework/styles/system/studies/size/)
- Under a quarter of the gap there is no rung, and that is the tell: if the space you want is that small, you are sizing a control, not spacing content.
- Above the gap there is no rung either. The step above `--gap` is `--flow`, and it stays bigger at every width now: `--gap`'s ceiling dropped from 2.6em to 2.4em on 2026-09-18 (the owner's call) so the row gap can no longer overtake the section step even at 3440 (43.19px against `--flow`'s 45px). [`doc/census.md`](./doc/census.md) has the before/after table and the two rejected alternatives.
- `.gap-2em` is the odd one out — a literal 2em from before the standard. A number with a unit is that length; a bare number is a percent of `--gap`.

## More
- Page: [/framework/styles/system/](/framework/styles/system/) — the seven lengths painted, the words, the rule.
- [`studies/`](/framework/styles/system/studies/) — the ten studies behind every number here, one click down. Moved from `/imagine/design/` 2026-09-18; four sibling studies (controls, layout, navigation, journey) went to their own module instead.
- [`doc/census.md`](./doc/census.md) why four rungs and not two — the 1,894-value census, the fit, the residue
- [`doc/rest.md`](./doc/rest.md) the rest of the system — type, colour, layers, layouts, and every study behind them
- The tokens themselves live in `/framework/framework.css` (`:where(*)`, and the `.pad` / `.gap` / `.gap-*` classes in `@layer util`). The long form of why they are shaped that way: [/framework/styles/system/studies/size/](/framework/styles/system/studies/size/).
