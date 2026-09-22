# navigation — does the navigation stay still when a column opens?

The study page is [`/web/nav/doc/study/`](/web/nav/doc/study/): one screen,
three rows of the same three-level tree, one button that presses all of them, and the numbers
under each. Today's row moves 129px and 225px; the stable row and the **even** row read 0 and 0.

## What is here

- `page.js` — the lab. The lede, the three rows, the rule in one sentence.
- `lab.js` — the three demo rows and the measurement. `DnStudy` is the set; `DnDemo` is one
  row, and its `mode` is `today` / `stable` / `even`. All three are built from **core's own
  column classes**, so they get exactly the cascade a real columns page gets, and the only
  difference between them is one class each.
- `navigation.css` — `.dn-*`. One rule in it, `.dn-stable`, was the deliverable and was meant
  to be lifted into `core/Page/Page.css`; everything else is this page's furniture.
- **The third row is core's shipped answer, not a proposal.** It wears core's own
  `.page-columns-even` and is sized by core's own `Page.even_columns()` — a static, so this
  row and a live page share one piece of arithmetic. The only thing this directory gives it is
  `--page-column-recommended: 20em`, because the default would fit exactly one column in a
  66rem box: [`/framework/core/Page/doc/columns/`](/framework/core/Page/doc/columns/).
- `numbers/` — the measured before/after on four real pages at four widths.
- `mechanisms/` — the catalogue of every navigation mechanism the site uses, with shots.
  This was the whole of this page until 2026-09-17; it is the detail, one click down.
- `shots/` — the screenshots both pages use.
- [`doc/decisions.md`](./doc/decisions.md) — what was decided and what is still open.

## Use

The rule is one declaration and it is written out, with the core lines it replaces and what
each of the six width words becomes, in
[`ai/2026-09-17/nav-stability/proposal.md`](/framework/ai/2026-09-17/nav-stability/). The
raw measurements are `measurements.json` beside it.

## Watch out

- **A demo host wearing `.page` is invisible unless it also says `default`.** The
  arrangement contract at the top of `Page.css` hides every page that is not marked, so the
  demo row rendered `display: none`, measured 0×0, and the readouts reported 0px for *both*
  halves — which looks exactly like a working stable row. `default` is the contract's own
  word for "shown without being routed to".
- **`.page-column-prose` is `0.9em` and every core column width is an `em`.** A demo of
  core's columns that inherits that font size is 90% of the real thing. `.dn-demo` pins
  itself to `1rem`.
- **A demo box that is too wide proves the opposite of the point.** Given room for a rail
  and two 40em columns, today's row does not squeeze anything and the button appears to do
  nothing. The bound is 66rem — a real browser window — and it lives on the lab's grid
  track, once, with the demo simply filling it. 90rem was tried and reverted:
  [`doc/decisions.md`](./doc/decisions.md).
- **The stable row does not scroll to the end on a press.** It used to, and that drove 450px
  of the middle column's 640 under the pinned rail at 1280 — head blank, words cut
  mid-letter — so the row that proves nothing moved looked like the broken one. The new
  column now arrives as a peek at the right-hand edge instead; only the phone regime, which
  has no pinned rail, still scrolls: [`doc/decisions.md`](./doc/decisions.md).
- **Every sentence in the readout is derived from the number beside it.** A branch on "is
  this the today row" put *"both columns got narrower"* next to a measured 0px at 400.

## More

- [`doc/decisions.md`](./doc/decisions.md) — the `dn-` prefix reservation, the third row, and
  the two tunings of the rule that are the owner's call.
- [`/framework/core/Page/doc/columns/`](/framework/core/Page/doc/columns/) — **the mode that
  shipped**: `columns({ even: true })`, N at every screen width, what stands down under it,
  and the three ways of animating the slide with their measured frame counts.
- The 2026-09-05 pass at [`/imagine/paging/navigation/`](/imagine/paging/navigation/) —
  the same question asked of the whole paging realm, and where `.paging-nav-fixed` (freeze
  at the floor) already ships.
