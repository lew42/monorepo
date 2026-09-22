# mobile-lists — nesting is padding: the same content as cards-in-cards and as a list, measured at 400

Load the `minion` skill first. Then this brief.

**Three laws.** Less is more (one page, one comparison, the numbers on it). Clear beats brief by far (a newcomer sees at a glance why three levels of cards fail on a phone). Prioritize.
**Length budget:** one screen at 400 and at 1280; the reasoning one click down. Your landing report is one screen with the numbers.
**The reader is the overwhelmed newcomer.** Shown, not told.

## The owner's words (2026-09-18, 12:30)

> One of the things I wanted to focus on is list UI. So mobile lists — that tree UI is like a single column, a mobile-friendly user interface. On a mobile there's not a lot of horizontal room to split, so nesting too many times, using cards with sub cards, you only have like two levels. Once you put something in a card it has to be double padded to have a background color different from the card color: padding on the outer container, padding on the card, and an inner card is three levels of padding from the edge of the viewport. That gets tricky pretty quick.

The layout skill now says it ("On a phone, nesting is padding"); this page is the detail it links to.

## Deliverables

1. **`/imagine/design/spacing/nesting/`** — one page (a child of `/imagine/design/spacing/`: one `children:` word + one visible line there). The same three-level content (a topic → its items → an item's details, real text from this site) drawn four ways side by side at 1280 and stacked at 400: (a) cards in cards in cards (three boxes, each with its own ground and `--pad`); (b) two levels (the page gutter + one box, the third level as rows inside it); (c) a flat list with hairlines and indent per level, no boxes; (d) `ux/Tree` on the same nodes (fold, adapt). Under each, live readouts measured off the rendered boxes: the content width left at the deepest level in px and as a % of the viewport, and the padding levels from the viewport edge. At 400 the takeaway sentence at the top is computed from those numbers ("three levels of cards leave N px for text; the list leaves M").
2. **The rule stated once**, in one sentence on the page, as the layout skill has it: two levels is the limit; below that a list, hierarchy from indent, weight and size.
3. **Docs:** the page's `decisions.md` (what was measured, the alternative — nesting with a single shared ground and hairlines, when it wins).

## Rules

- Load `code`, `layout` (all of it — the box rule, the ladder rungs, "under a COLUMNS host there is no page grid": `/imagine/` is one), `css`, `new-css-class` (the design realm's prefix — read `css-scopes.txt`); `new-task` before the first edit (your dir exists: `ai/2026-09-18/mobile-lists/`); `documentation` then `finish-task`; `skill-improvement` for any skill that misled you.
- **Fence:** `public/imagine/design/spacing/nesting/**` (new), one `children:` word + one line in `public/imagine/design/spacing/page.js`, your task dir. Nothing else.
- The owner's dev server (port 80) is running: never touch it. Your own: `PORT=8119 node server.js` from the repo root, background, killed by its real Windows PID when you land. Never `git stash`, never `find /`, never drive the owner's tabs. `ui-test` has the headless recipe; shots at 400 and 1280 into your task dir.
- Two numbers that must agree: the readout on the page and your own headless measurement of the deepest content width for variant (a) at 400.
- Landing: `outcome` = a headline with the two decisive numbers, the link, the two shots, what was left and why. One screen.
